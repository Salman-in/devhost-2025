"use client";
import Script from "next/script";

interface SuccessResponse {
  razorpay_signature: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
}

interface CheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: SuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: "card" | "netbanking" | "wallet" | "emi" | "upi";
  };
  theme?: {
    color: string;
  };
  notes?: Record<string, any>;
}

declare global {
  interface Window {
    Razorpay: new (options: CheckoutOptions) => { open(): void };
  }
}

export default function PaymentButton({ amount = 100 }: { amount?: number }) {
  const startPayment = async () => {
    // Create order on server
    const createRes = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const order = await createRes.json();
    if (!order || order.error) return alert("Order creation failed: " + (order?.error || "unknown"));

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency,
      name: "Hackathon Project",
      description: "Ticket",
      order_id: order.id,
      handler: async function (response: SuccessResponse) {
        // Verify on server
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            amount: order.amount, // send amount too
          }),
        });

        const verify = await verifyRes.json();
        if (verify.ok) {
          alert("Payment verified and stored in Firestore. Payment ID: " + response.razorpay_payment_id);
        } else {
          alert("Verification failed: " + (verify.error || "unknown"));
        }
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button onClick={startPayment}>Pay ₹{(amount / 100).toFixed(2)}</button>
    </>
  );
}
