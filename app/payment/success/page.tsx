"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ClippedButton } from "@/components/ClippedButton";

function PaymentSuccessPageContent() {
  const [status, setStatus] = useState("Verifying payment...");
  const [showBack, setShowBack] = useState(false);
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("order_id");
  const from = params.get("from") ?? "/";

  useEffect(() => {
    if (!orderId) {
      setStatus("Order ID is missing.");
      setShowBack(true);
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/v1/verify-payment?order_id=${orderId}`);
        const data = await res.json();

        if (data.status === "SUCCESS") {
          setStatus("Payment verified successfully. Redirecting...");
          setTimeout(() => router.push(from), 2000);
        } else if (data.status === "FAIL") {
          setStatus("Payment verification failed");
          setShowBack(true);
        } else {
          setStatus("Unknown payment status");
          setShowBack(true);
        }
      } catch {
        setStatus("Payment verification failed due to a network error.");
        setShowBack(true);
      }
    };

    verifyPayment();
  }, [orderId, from, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">{status}</h1>
        <p className="mt-2 break-all text-gray-600">
          Order ID: {orderId || "Not Provided"}
        </p>

        {showBack && (
          <div className="mt-4 flex justify-center">
            <ClippedButton
              onClick={() => router.replace(from)}
              className="w-full sm:w-auto"
            >
              Go Back
            </ClippedButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={<div className="flex h-screen items-center justify-center" />}
    >
      <PaymentSuccessPageContent />
    </Suspense>
  );
}
