// pages/api/v1/events/[eventid]/teams/[teamid]/pay.ts
import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { eventDetails } from "@/assets/data/eventPayment";

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

    // Server-side event price
    const eventIdNum = Number(eventId);
    const eventDetail = eventDetails[eventIdNum];
    if (!eventDetail) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const rz = new Razorpay({
      key_id:
        process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const payment = await rz.payments.fetch(razorpay_payment_id);
    const expectedAmount = Math.round(eventDetail.amount * 100 * 1.05);

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

    // Flat structure: team doc directly in registrations
    const ref = adminDb.collection("registrations").doc(teamId);
    const teamSnap = await ref.get();

    if (!teamSnap.exists) {
      return NextResponse.json(
        { error: "Team not found", success: false },
        { status: 404 },
      );
    }

    const teamData = teamSnap.data() as {
      eventId?: string;
      leaderEmail?: string;
      members?: string[];
      paymentDone?: boolean;
    };

    // Ensure the team belongs to this event
    if (teamData.eventId !== eventId) {
      return NextResponse.json(
        { error: "Team does not belong to this event", success: false },
        { status: 400 },
      );
    }

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

    if (!teamData.members || teamData.members.length !== eventDetail.min) {
      return NextResponse.json(
        {
          error: `Team must have at least ${eventDetail.min} members to pay`,
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
