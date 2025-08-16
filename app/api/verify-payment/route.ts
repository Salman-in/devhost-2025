import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Verified — here you can:
      // - write a record to your DB (recommended: via Firebase Admin on server)
      // - or allow client to write to Firestore after server confirmation
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
