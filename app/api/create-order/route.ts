import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json(); // amount in paise, e.g. 50000 for ₹500
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
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
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
