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
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }


    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Fetch payment details from Razorpay
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
            ).toString("base64"),
        },
      },
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch payment details" },
        { status: 502 },
      );
    }
    const paymentDetails = await response.json();
    const rawStatus = paymentDetails.status;

    const status = rawStatus === "captured" ? "paid" : rawStatus;

    // Get the paid amount from Razorpay (in paise)
    const amount = paymentDetails.amount;

    // Store in Firestore

    await adminDb
      .collection("payments")
      .doc(razorpay_payment_id)
      .set({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status,
        amount,
        method: paymentDetails.method || null,
        email: paymentDetails.email || null,
        contact: paymentDetails.contact || null,
        createdAt: new Date().toISOString(),
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
