"use client";

import Script from "next/script";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useState } from "react";

interface PaymentButtonProps {
  amount: number;
  eventTitle: string;
  organizer: string;
  eventId: string | number;
  userEmail: string;
}

export default function PaymentButton({
  amount = 100,
  eventTitle,
  organizer,
  eventId,
  userEmail,
}: PaymentButtonProps) {
  const [errorMsg, setErrorMsg] = useState<string>("");

  const startPayment = async () => {
    try {
      // Request order creation from backend
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const order = await createRes.json();
      if (!order || order.error) {
        setErrorMsg(order?.error || "Failed to create order.");
        return;
      }

      // Initialize Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: eventTitle,
        description: `Registration for ${eventTitle}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Verify payment on server
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              event_id: String(eventId).trim(),
              user_email: userEmail.trim().toLowerCase(),
              amount: order.amount,
            }),
          });

          const verify = await verifyRes.json();

          if (verify.ok) {
            // Save payment info to Firestore
            await setDoc(doc(db, "payments", response.razorpay_payment_id), {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              status: "Paid",
              amount: order.amount,
              eventTitle,
              organizer,
              userEmail,
              createdAt: new Date().toISOString(),
            });

            // Redirect to dashboard after success
            window.location.href = "/events/dashboard";
          } else {
            // Show error message in UI
            setErrorMsg(verify.error || "Payment verification failed.");
          }
        },
        prefill: {
          name: "Your Name", // Replace with user info if available
          email: userEmail,
          contact: "",
        },
        theme: { color: "#3399cc" },
      };

      // Open Razorpay checkout form
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      setErrorMsg(
        error?.message || "Payment initialization failed. Please try again."
      );
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={startPayment}
        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Pay ₹{(amount / 100).toFixed(2)}
      </button>
      {errorMsg && <div className="mt-3 text-red-600 text-sm">{errorMsg}</div>}
    </>
  );
}
