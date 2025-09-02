import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventid: string; teamid: string } },
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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return NextResponse.json(
        { error: "Missing Razorpay payment verification fields", success: false },
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
          amount,
        }),
      }
    );

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.ok) {
      return NextResponse.json(
        { error: verifyData.error || "Payment verification failed", success: false },
        { status: 400 },
      );
    }

    // Update Firestore registration data for this team
    const ref = adminDb
      .collection("registrations")
      .doc(eventId)
      .collection("teams")
      .doc(teamId);

    await ref.update({
      paymentDone: true,
      registered: true,
      paymentId: razorpay_payment_id,
      paymentAmount: amount,
      paymentTimestamp: new Date().toISOString(),
    });

    const updatedDoc = await ref.get();
    const updatedTeam = updatedDoc.data();

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (err: unknown) {
    console.error("Team pay error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err), success: false },
      { status: 500 },
    );
  }
}