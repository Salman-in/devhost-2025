import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      event_id,
      user_email,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Save payment record in 'payments' collection
    await adminDb
      .collection("payments")
      .doc(razorpay_payment_id)
      .set({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: "Paid",
        amount: amount || null,
        createdAt: new Date().toISOString(),
      });

    // Update registration document payment status
    const registrationsRef = adminDb.collection("event_registrations");

    const normalizedEmail = user_email.trim().toLowerCase();
    const eventIdStr = String(event_id).trim();

    const querySnapshot = await registrationsRef
      .where("event_id", "==", eventIdStr)
      .where("participants", "array-contains", normalizedEmail)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { warning: "Registration not found, but payment recorded" },
        { status: 200 }
      );
    }

    const docId = querySnapshot.docs[0].id;

    await registrationsRef.doc(docId).update({
      paymentStatus: "Paid",
      paymentDetails: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paidAt: new Date().toISOString(),
        amount: amount || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
