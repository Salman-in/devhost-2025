"use client";
import { useState } from "react";
import { toast } from "sonner";

interface CashfreeSuccessResponse {
  order_id: string;
  payment_id?: string;
  payment_status?: string;
  payment_amount?: number;
  payment_time?: string;
}

interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  returnUrl?: string;
  redirectTarget?: "_self" | "_blank" | "_parent" | "_top";
}

declare global {
  interface Window {
    Cashfree: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: CashfreeCheckoutOptions) => Promise<void>;
    };
  }
}

type PaymentButtonProps = {
  amount: number;
  disabled?: boolean;
  onPaymentSuccess: (response: CashfreeSuccessResponse) => void;
  eventName: string;
  eventId?: string;
  teamId?: string;
};

export default function PaymentButton({
  amount,
  disabled = false,
  onPaymentSuccess,
  eventName,
  eventId,
  teamId,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && window.Cashfree) {
        resolve(window.Cashfree);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.onload = () => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          reject(new Error("Cashfree SDK not loaded"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
      document.head.appendChild(script);
    });
  };

  const startPayment = async () => {
    if (disabled || loading) return;
    setLoading(true);

    try {
      // Load Cashfree SDK
      await loadCashfreeSDK();

      // Create order
      const currentPath = window.location.pathname;
      const createRes = await fetch("/api/v1/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          redirectUrl: `${window.location.origin}/payment/success?from=${encodeURIComponent(currentPath)}`,
          eventId,
          teamId,
        }),
      });

      if (!createRes.ok) {
        const err: { error?: string } = await createRes
          .json()
          .catch(() => ({}));
        toast.error(
          "Order creation failed: " + (err?.error || createRes.status),
        );
        setLoading(false);
        return;
      }

      const order: {
        paymentSessionId?: string;
        orderId?: string;
        error?: string;
        message?: string;
      } = await createRes.json();

      if (!order || !order.paymentSessionId) {
        toast.error(
          "Order creation failed: " +
            (order?.error || order?.message || "unknown"),
        );
        setLoading(false);
        return;
      }

      // Initialize Cashfree
      const cashfree = window.Cashfree({
        mode:
          process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
            ? "production"
            : "sandbox",
      });

      // Checkout options
      const checkoutOptions: CashfreeCheckoutOptions = {
        paymentSessionId: order.paymentSessionId,
        returnUrl: `${window.location.origin}/payment/success?order_id=${order.orderId}`,
      };

      // Open Cashfree checkout
      await cashfree.checkout(checkoutOptions);

      setLoading(false);
    } catch (err) {
      toast.error("Could not start payment. Please try again.");
      console.error("Payment error:", err);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={startPayment}
        disabled={disabled || loading}
        className="bg-primary w-full rounded px-5 py-2 text-xs font-bold tracking-widest text-black uppercase disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
      </button>
    </>
  );
}
