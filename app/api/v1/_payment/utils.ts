// app/api/v1/_payment/utils.ts
import { NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

export async function payment_helper(req: Request) {
  try {
    const { amount, redirectUrl } = await req.json();

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

    const cashfree = new Cashfree(
      CFEnvironment.SANDBOX, // Use Cashfree.PRODUCTION for production
      process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID!,
      process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET!,
    );

    const response = await cashfree.PGCreateOrder(orderRequest);

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

    if (errorDetails) {
      console.error("Error details:", errorDetails);
    }

    return NextResponse.json(
      {
        error: errorDetails || errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    );
  }
}
