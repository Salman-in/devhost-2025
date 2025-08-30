"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import React from "react";

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

interface PaymentButtonProps {
  amount: number; // in paise
  leader: string;
  eventId: string | number;
  eventName: string;
}

export default function PaymentButton({
  amount,
  leader,
  eventId,
  eventName,
}: PaymentButtonProps) {
  const router = useRouter();

  const startPayment = async () => {
    const createRes = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, eventId, leader }),
    });

    const order = await createRes.json();
    if (!order || order.error) {
      alert(
        "Order creation failed: " +
          (typeof order?.error === "string"
            ? order.error
            : JSON.stringify(order?.error || "unknown")),
      );

      return;
    }

    const options: CheckoutOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency,
      name: eventName,
      description: `Registration for ${eventName}`,
      order_id: order.id,
      handler: async function (response: SuccessResponse) {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            amount: order.amount,
            eventId,
            leader,
          }),
        });

        const verify = await verifyRes.json();
        if (verify.ok) {
          // Move redirect here
          router.push(
            `/events/individual/${eventId}/success?paymentId=${response.razorpay_payment_id}&email=${encodeURIComponent(
              leader,
            )}`,
          );
        } else {
          alert("Verification failed: " + (verify.error || "unknown"));
        }
      },
      prefill: {
        name: "Test User",
        email: leader,
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
      <button
        onClick={startPayment}
        className="rounded bg-green-600 px-6 py-2 font-bold text-white"
      >
        Pay ₹{(amount / 100).toFixed(2)}
      </button>
    </>
  );
}
