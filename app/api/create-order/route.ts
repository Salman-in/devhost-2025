import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Amount in paise, e.g. 10000 for ₹100
    const amount = body?.amount;
    if (amount == null) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }
    if (
      typeof amount !== "number" ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Amount must be a positive integer in paise" },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing Razorpay credentials" },
        { status: 500 }
      );
    }
    const instance = new Razorpay({ key_id, key_secret });

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (err: any) {
    console.error(err);
    const message =
      err?.error?.description ??
      err?.message ??
      (typeof err === "string" ? err : "Unknown error");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
