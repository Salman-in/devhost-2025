"use client";
import Script from "next/script";
import { useState } from "react";

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

type PaymentButtonProps = {
  amount: number;
  disabled?: boolean;
  onPaymentSuccess: (response: SuccessResponse) => void;
  eventName: string;
};

export default function PaymentButton({
  amount,
  disabled = false,
  onPaymentSuccess,
  eventName,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    if (disabled || loading) return;

    setLoading(true);

    // Create order on server
    const createRes = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const order = await createRes.json();
    if (!order || order.error) {
      alert("Order creation failed: " + (order?.error || "unknown"));
      setLoading(false);
      return;
    }

    const options: CheckoutOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: order.amount,
      currency: order.currency || "INR",
      name: eventName, // Dynamic event name
      description: "Ticket",
      order_id: order.orderId || order.id,
      handler: function (response: SuccessResponse) {
        onPaymentSuccess(response);
        setLoading(false);
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
      <button
        onClick={startPayment}
        disabled={disabled || loading}
        className="bg-primary w-full rounded px-5 py-2 text-xs font-bold tracking-widest text-black uppercase"
      >
        {loading ? "Processing..." : `Pay ₹${(amount / 100).toFixed(2)}`}
      </button>
    </>
  );
}