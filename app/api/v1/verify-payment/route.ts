import admin, { adminDb } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

const POLL_DELAY_MS = 3000;
const MAX_POLL_ATTEMPTS = 5;

async function pollPaymentStatus(
  cashfree: Cashfree,
  orderId: string,
  cfPaymentId: string | undefined,
) {
  if (!cfPaymentId) return "FAIL";

  let attempt = 0;
  let status: string | undefined = "PENDING";

  while (attempt < MAX_POLL_ATTEMPTS && status === "PENDING") {
    const res = await cashfree.PGOrderFetchPayment(orderId, cfPaymentId);
    status = res.data?.payment_status;
    if (status === "SUCCESS" || status === "FAILED" || status === "CANCELLED") {
      return status;
    }
    attempt++;
    await new Promise((res) => setTimeout(res, POLL_DELAY_MS));
  }

  return status || "FAIL";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");
  if (!orderId)
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });

  const clientId =
    process.env.CASHFREE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
  const clientSecret =
    process.env.CASHFREE_CLIENT_SECRET ||
    process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return NextResponse.json(
      { error: "Missing Cashfree credentials" },
      { status: 500 },
    );

  const env =
    process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX;

  const cashfree = new Cashfree(env, clientId, clientSecret);

  try {
    const orderRes = await cashfree.PGFetchOrder(orderId);
    const orderStatus = orderRes.data?.order_status;

    const paymentInfo = {
      orderId,
      amount: orderRes.data?.order_amount,
      currency: orderRes.data?.order_currency,
      created_at: new Date().toISOString(),
      status: "FAIL" as "SUCCESS" | "FAIL",
    };

    // If already paid
    if (orderStatus === "PAID") {
      paymentInfo.status = "SUCCESS";
    }

    // If ACTIVE, poll payment status
    if (orderStatus === "ACTIVE") {
      const paymentsRes = await cashfree.PGOrderFetchPayments(orderId);
      const payments = paymentsRes.data || [];

      if (payments.length) {
        const finalStatus = await pollPaymentStatus(
          cashfree,
          orderId,
          payments[0].cf_payment_id,
        );
        paymentInfo.status = finalStatus === "SUCCESS" ? "SUCCESS" : "FAIL";
      }
    }

    // Store/update Firebase registrations & payments if SUCCESS
    if (paymentInfo.status === "SUCCESS") {
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
                    amount: orderRes.data?.order_amount ?? null,
                    currency: orderRes.data?.order_currency ?? null,
                    paymentTime: new Date().toISOString(),
                    status: paymentInfo.status,
                    customer_details: orderRes.data?.customer_details ?? null,
                    cf_order_id: orderRes.data?.cf_order_id ?? null,
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
