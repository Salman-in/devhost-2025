import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb, adminAuth } from "@/firebase/admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      eventId,
    } = await req.json();

    // Validate required parameters
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !eventId
    ) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Verify Razorpay signature for authenticity
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Verify user session from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("__session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    let userEmail: string | null = null;
    try {
      const decodedToken = await adminAuth.verifySessionCookie(token, true);
      userEmail = decodedToken.email ?? null;
      if (!userEmail) {
        return NextResponse.json(
          { error: "Invalid user token" },
          { status: 401 },
        );
      }
    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.json(
        { error: "Token verification failed" },
        { status: 401 },
      );
    }

    // Check if user already registered for this event
    const registrationSnapshot = await adminDb
      .collection("registrations")
      .where("eventId", "==", eventId)
      .where("userEmail", "==", userEmail)
      .where("paymentStatus", "==", "paid")
      .limit(1)
      .get();

    if (!registrationSnapshot.empty) {
      // User already registered — reject duplicate payment
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 400 },
      );
    }

    // Store payment data
    await adminDb
      .collection("payments")
      .doc(razorpay_payment_id)
      .set({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: "paid",
        amount: amount || null,
        createdAt: new Date().toISOString(),
        userEmail,
        eventId,
      });

    // Store registration record
    await adminDb.collection("registrations").add({
      eventId,
      userEmail,
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      registeredAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Verify-payment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
