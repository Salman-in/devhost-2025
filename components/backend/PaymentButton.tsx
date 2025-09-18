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
  notes?: Record<string, string | number | boolean | null>;
  modal?: {
    ondismiss?: () => void;
  };
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
    try {
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        alert("Payment configuration missing.");
        setLoading(false);
        return;
      }
      if (typeof window === "undefined" || !window.Razorpay) {
        alert("Payment SDK not loaded yet. Please retry in a moment.");
        setLoading(false);
        return;
      }

      // Create order on server
      const createRes = await fetch("/api/v1/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!createRes.ok) {
        const err: { error?: string } = await createRes
          .json()
          .catch(() => ({}));
        alert("Order creation failed: " + (err?.error || createRes.status));
        setLoading(false);
        return;
      }

      const order: {
        amount: number;
        currency?: string;
        orderId?: string;
        id?: string;
        error?: string;
      } = await createRes.json();

      if (!order || order.error) {
        alert("Order creation failed: " + (order?.error || "unknown"));
        setLoading(false);
        return;
      }

      const options: CheckoutOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency || "INR",
        name: eventName,
        description: "Ticket",
        order_id: order.orderId || order.id!,
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
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Could not start payment. Please try again.");
      setLoading(false);
    }
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
