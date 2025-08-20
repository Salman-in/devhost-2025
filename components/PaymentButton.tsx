"use client";

import Script from "next/script";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

interface PaymentButtonProps {
  amount: number;
  eventTitle: string;
  organizer: string;
  eventId: string | number;
  userEmail: string;
}

export default function PaymentButton({
  amount,
  eventTitle,
  organizer,
  eventId,
  userEmail,
}: PaymentButtonProps) {
  const startPayment = async () => {
    try {
      // Create order on server
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const order = await createRes.json();
      if (!order || order.error) {
        alert("Order creation failed: " + (order.error || "Unknown error"));
        return;
      }

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
            }),
          });

          const verify = await verifyRes.json();
          if (verify.ok) {
            // Optionally also save payment info separately in Firestore
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

            alert(`Payment successful for "${eventTitle}". Payment ID: ${response.razorpay_payment_id}`);
            // Redirect to dashboard or elsewhere after success
            window.location.href = "/events/dashboard";
          } else {
            alert("Payment verification failed: " + (verify.error || "unknown"));
          }
        },
        prefill: {
          name: "Your Name",
          email: userEmail,
          contact: "",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Payment initialization failed. Please try again.");
      console.error(error);
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
    </>
  );
}
