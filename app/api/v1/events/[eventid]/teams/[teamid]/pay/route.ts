import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventid: string; teamid: string }> },
) {
  try {
    // Authenticate user
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { eventid: eventId, teamid: teamId } = params;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          error: "Missing Razorpay payment verification fields",
          success: false,
        },
        { status: 400 },
      );
    }

    // Call verify-payment API internally (same project)
    const verifyRes = await fetch(
      new URL("/api/verify-payment", req.url).toString(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
      },
    );

    // Verify against Razorpay Payments API
    const Razorpay = (await import("razorpay")).default as any;
    const rz = new Razorpay({
      key_id:
        process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    const payment = await rz.payments.fetch(razorpay_payment_id);
    if (
      payment?.status !== "captured" ||
      payment?.order_id !== razorpay_order_id
    ) {
      return NextResponse.json(
        {
          error: "Payment not captured or does not match order",
          success: false,
        },
        { status: 400 },
      );
    }
    const verifiedAmount = Number(payment.amount);

    // Update Firestore registration data for this team
    const ref = adminDb
      .collection("registrations")
      .doc(eventId)
      .collection("teams")
      .doc(teamId);

    // Authorization: leader-only, idempotency, and team-size (if available)
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
      return NextResponse.json({ success: true, team: teamData }); // idempotent
    }
    if (!teamData.leaderEmail || decoded.email !== teamData.leaderEmail) {
      return NextResponse.json(
        { error: "Only the team leader can complete payment", success: false },
        { status: 403 },
      );
    }

    // Update Firestore registration data for this team
    await ref.update({
      paymentDone: true,
      registered: true,
      paymentId: razorpay_payment_id,
      paymentAmount: verifiedAmount,
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
