// app/api/v1/_payment/utils.ts
import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { adminDb } from "@/firebase/admin";

export async function payment_helper(req: Request) {
  try {
    // Read body once (avoid calling req.json() multiple times)
    const body = await req.json().catch(() => ({}));
    const { amount, redirectUrl, eventId, teamId } = body as {
      amount?: number | string;
      redirectUrl?: string;
      eventId?: string;
      teamId?: string;
    };

    if (!amount || Number.isNaN(Number(amount))) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!redirectUrl || typeof redirectUrl !== "string") {
      return NextResponse.json({ error: "Invalid redirectUrl" }, { status: 400 });
    }

    // Apply 5% markup server-side for final charge
    const chargeAmount = Number(amount) * 1.05;

    const orderId = `order_${Date.now()}`;

    const orderRequest = {
      order_amount: parseFloat(chargeAmount.toFixed(2)),
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: "Yishith", // Default name
        customer_email: "yishithvilas@gmail.com", // Default email
        customer_phone: "9964057549", // Default phone
      },
      order_meta: {
        return_url: `${redirectUrl}?order_id={order_id}`,
      },
    };

    // Use server-only env vars for secrets. NEXT_PUBLIC_* values are exposed to client
    const clientId = process.env.CASHFREE_CLIENT_ID || process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET || process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Cashfree credentials. Set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET in your environment.");
      return NextResponse.json({ error: "Missing Cashfree credentials" }, { status: 500 });
    }

    const env = (process.env.NEXT_PUBLIC_CASHFREE_MODE === "production") ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

    const cashfree = new Cashfree(env, clientId, clientSecret);

    const response = await cashfree.PGCreateOrder(orderRequest);

    // If caller attached eventId/teamId, write pendingOrderId to the registration doc
    if (teamId) {
      try {
        const ref = adminDb.collection("registrations").doc(teamId);
        const snap = await ref.get();
        if (snap.exists) {
          await ref.update({
            pendingOrderId: orderId,
            pendingOrderAmount: response?.data?.order_amount ?? parseFloat(chargeAmount.toFixed(2)),
            pendingOrderCreatedAt: new Date().toISOString(),
          });
        } else {
          console.warn(`Registration doc not found for teamId=${teamId}; skipping pendingOrder write.`);
        }
      } catch (e) {
        console.error("Failed to set pendingOrderId on registration:", e);
      }
    }

    if (!response || !response.data) {
      console.error("Cashfree response missing data:", response);
      return NextResponse.json({ error: "Unexpected Cashfree response" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: orderId,
      paymentSessionId: response.data.payment_session_id,
      amount: response.data.order_amount,
      currency: response.data.order_currency,
    });
  } catch (err: unknown) {
    console.error("Error creating order:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorDetails = err;

    // Don't leak secrets, but return helpful error messages during development
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    );
  }
}
