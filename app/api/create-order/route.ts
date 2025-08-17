import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json(); // amount in paise, e.g. 50000 for ₹500
    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET); 
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    const message =
      err?.error?.description ||
      err?.message ||
      (typeof err === "string" ? err : "Unknown error");

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
