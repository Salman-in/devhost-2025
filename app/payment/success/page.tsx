// app/payment/success/page.tsx
//this will show payment success or failure based on order_id passed in query params
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState("Verifying...");
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const from = params.get("from") || "/";

  useEffect(() => {
    if (orderId) {
      fetch(`/api/v1/verify-payment?order_id=${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "PAID") {
            setStatus("✅ Payment Successful");
            // Redirect back after a delay (optional)
            if (from) setTimeout(() => (window.location.href = from), 4000);
          } else {
            setStatus("Payment Failed or Pending");
          }
        })
        .catch(() => setStatus("Verification Failed"));
    }
  }, [orderId]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold">{status}</h1>
      <p className="mt-2 text-gray-600">Order ID: {orderId}</p>
    </div>
  );
}
