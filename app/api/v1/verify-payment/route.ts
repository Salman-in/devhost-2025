// app/api/v1/verify-payment/route.ts
import admin, { adminDb } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  try {
    const clientId =
      process.env.CASHFREE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
    const clientSecret =
      process.env.CASHFREE_CLIENT_SECRET ||
      process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Cashfree credentials for verification");
      return NextResponse.json(
        { error: "Missing Cashfree credentials" },
        { status: 500 },
      );
    }

    const env =
      process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX;

    const cashfree = new Cashfree(env, clientId, clientSecret);

    const response = await cashfree.PGFetchOrder(orderId);
    const status = response.data.order_status;

    // Build payment info
    const paymentInfo = {
      orderId,
      amount: response.data.order_amount,
      currency: response.data.order_currency,
      status: status,
      created_at: new Date().toISOString(),
    };

    // Find registration(s) that have pendingOrderId equal to this orderId
    try {
      const regsQuery = await adminDb
        .collection("registrations")
        .where("pendingOrderId", "==", orderId)
        .get();

      if (!regsQuery.empty) {
        regsQuery.forEach(async (doc) => {
          const reg = doc.data();
          if (!reg?.paymentDone) {
            await doc.ref.update({
              paymentDone: true,
              registered: true,
              // remove any sensitive or detailed paymentInfo stored previously
              paymentInfo: admin.firestore.FieldValue.delete(),
              // cleanup pending fields
              pendingOrderId: admin.firestore.FieldValue.delete(),
              pendingOrderAmount: admin.firestore.FieldValue.delete(),
              pendingOrderCreatedAt: admin.firestore.FieldValue.delete(),
            });
          }
        });
      }
    } catch (e) {
      console.error("Failed to update registration for pending order:", e);
    }

    //rest of them same
    return NextResponse.json(paymentInfo);
  } catch (err) {
    console.error("Error verifying order:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
