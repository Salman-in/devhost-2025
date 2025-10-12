import admin, { adminDb } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");

  if (!orderId)
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });

  try {
    const clientId =
      process.env.CASHFREE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
    const clientSecret =
      process.env.CASHFREE_CLIENT_SECRET ||
      process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Cashfree credentials.");
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
    const status = response.data?.order_status;

    const paymentInfo = {
      orderId,
      amount: response.data?.order_amount,
      currency: response.data?.order_currency,
      status: status || "UNKNOWN",
      created_at: new Date().toISOString(),
    };

    if (status === "PAID") {
      try {
        const regsQuery = await adminDb
          .collection("registrations")
          .where("pendingOrderId", "==", orderId)
          .get();

        if (!regsQuery.empty) {
          await Promise.all(
            regsQuery.docs.map(async (doc) => {
              const reg = doc.data();
              if (!reg?.paymentDone) {
                await doc.ref.update({
                  paymentDone: true,
                  registered: true,
                  paymentInfo: admin.firestore.FieldValue.delete(),
                  pendingOrderId: admin.firestore.FieldValue.delete(),
                  pendingOrderAmount: admin.firestore.FieldValue.delete(),
                  pendingOrderCreatedAt: admin.firestore.FieldValue.delete(),
                });
                try {
                  await adminDb.collection("payments").add({
                    orderId,
                    registrationId: doc.id,
                    amount: response.data?.order_amount ?? null,
                    currency: response.data?.order_currency ?? null,
                    paymentTime: new Date().toISOString(),
                    status,
                    customer_details: response.data?.customer_details ?? null,
                    cf_order_id: response.data?.cf_order_id ?? null,
                    payment_session_id:
                      response.data?.payment_session_id ?? null,
                  });
                } catch (e) {
                  console.error("Failed to insert payment record:", e);
                }
              }
            }),
          );
        }
      } catch (e) {
        console.error("Failed to update registration for pending order:", e);
      }
    }

    return NextResponse.json(paymentInfo);
  } catch (err) {
    console.error("Error verifying order:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
