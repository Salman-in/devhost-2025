import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/firebase/admin";
import admin from "@/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, event_id, user_email } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    
    const generated_signature = crypto
      .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET! )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // ✅ Verified → store in Firestore
    await adminDb.collection("payments").doc(razorpay_payment_id).set({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "paid",
      amount: amount || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Verify-payment error:", err);

    // Normalize email to lowercase
    const normalizedEmail = user_email.trim().toLowerCase();
    const eventIdStr = String(event_id).trim();

    console.log("Verifying payment:", {
      razorpay_order_id,
      razorpay_payment_id,
      event_id: eventIdStr,
      user_email: normalizedEmail,
    });

    const firestore = getFirestore(admin.app());
    const registrationsRef = firestore.collection("event_registrations");

      const querySnapshot = await registrationsRef
        .where("event_id", "==", eventIdStr)
        .where("participants", "array-contains", normalizedEmail)
        .get();

      if (querySnapshot.empty) {
        console.error(
        `No registration found for event_id: ${eventIdStr} and user_email: ${normalizedEmail}`
      );
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
      }

      const docId = querySnapshot.docs[0].id;

      await registrationsRef.doc(docId).update({
        paymentStatus: "Paid",
        paymentDetails: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          paidAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({ ok: true });
    }  catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
