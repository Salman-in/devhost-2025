// app/api/v1/verify-payment/route.ts
import { adminDb } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  try {
    const cashfree = new Cashfree(
      CFEnvironment.SANDBOX,
      process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID!,
      process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET!,
    );

    const response = await cashfree.PGFetchOrder(orderId);
    const status = response.data.order_status;

    // 🧾 Store in DB here
    const paymentInfo = {
      order_id: orderId,
      amount: response.data.order_amount,
      currency: response.data.order_currency,
      status: status,
      created_at: new Date().toISOString(),
    };

    // ✅ Store payment info in Firebase
    //await adminDb.collection("payments").doc(orderId).set(paymentInfo);

    //rest of them same
    return NextResponse.json(paymentInfo);
  } catch (err) {
    console.error("Error verifying order:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
