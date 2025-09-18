import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { eventDetails } from "@/assets/data/eventPayment";

/**
 * Minimal typing for the subset of the Razorpay SDK used here.
 * We avoid `any` by declaring the shapes we need.
 */
interface RazorpayPayment {
  status?: string;
  order_id?: string;
  amount?: number;
  [key: string]: unknown;
}

interface RazorpayPaymentsAPI {
  fetch(paymentId: string): Promise<RazorpayPayment>;
}

interface RazorpayInstance {
  payments: RazorpayPaymentsAPI;
}

type RazorpayConstructor = new (opts: {
  key_id: string;
  key_secret: string;
}) => RazorpayInstance;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventid: string; teamid: string }> },
) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { eventid: eventId, teamid: teamId } = await params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          error: "Missing Razorpay payment verification fields",
          success: false,
        },
        { status: 400 },
      );
    }

    // Get server authoritative event price and team size
    const eventIdNum = Number(eventId);
    const eventDetail = eventDetails[eventIdNum];
    if (!eventDetail) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    // Dynamically import Razorpay and type it using our RazorpayConstructor
    const RazorpayImport = await import("razorpay");
    const Razorpay = (RazorpayImport.default ??
      RazorpayImport) as unknown as RazorpayConstructor;

    const rz = new Razorpay({
      key_id:
        process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const payment = await rz.payments.fetch(razorpay_payment_id);

    const expectedAmount = eventDetail.amount * eventDetail.max * 100; // amount in paise
    if (
      payment?.status !== "captured" ||
      payment?.order_id !== razorpay_order_id ||
      Number(payment.amount) !== expectedAmount
    ) {
      return NextResponse.json(
        {
          error: "Payment not captured or amount mismatch",
          success: false,
        },
        { status: 400 },
      );
    }

    // Check team doc and leader
    const ref = adminDb
      .collection("registrations")
      .doc(eventId)
      .collection("teams")
      .doc(teamId);

    const teamSnap = await ref.get();
    if (!teamSnap.exists) {
      return NextResponse.json(
        { error: "Team not found", success: false },
        { status: 404 },
      );
    }
    const teamData = teamSnap.data() as {
      leaderEmail?: string;
      members?: string[];
      paymentDone?: boolean;
    };
    if (teamData.paymentDone) {
      return NextResponse.json({ success: true, team: teamData });
    }
    if (!teamData.leaderEmail || decoded.email !== teamData.leaderEmail) {
      return NextResponse.json(
        {
          error: "Only the team leader can complete payment",
          success: false,
        },
        { status: 403 },
      );
    }
    if (!teamData.members || teamData.members.length !== eventDetail.max) {
      return NextResponse.json(
        {
          error: `Team must have exactly ${eventDetail.max} members to pay`,
          success: false,
        },
        { status: 400 },
      );
    }

    // Firestore update
    await ref.update({
      paymentDone: true,
      registered: true,
      paymentId: razorpay_payment_id,
      paymentAmount: payment.amount,
      paymentTimestamp: new Date().toISOString(),
    });

    const updatedDoc = await ref.get();
    const updatedTeam = updatedDoc.data();

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (err: unknown) {
    console.error("Team pay error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
        success: false,
      },
      { status: 500 },
    );
  }
}
