"use client";
import Script from "next/script";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

interface PaymentButtonProps {
  amount: number;
  eventTitle: string;
  organizer: string;
}

export default function PaymentButton({
  amount = 10000,
  eventTitle,
  organizer,
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
      if (!order || order.error){
      console.error("Order creation error details:", order);
      const errorMsg = typeof order.error === "string" ? order.error : JSON.stringify(order.error);
      alert("Order creation failed: " + errorMsg);
      return;
      }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // Razorpay Key from env
        amount: order.amount,
        currency: order.currency,
        name: eventTitle, // Use event title as name
        description: `Registration for ${eventTitle}`, // Description with event info
        order_id: order.orderId || order.id,
        handler: async function (response: any) {
          // Verify payment on server
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verify = await verifyRes.json();
          if (verify.ok) {
            // Save payment info to Firestore with event details
            await setDoc(doc(db, "payments", response.razorpay_payment_id), {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              status: "paid",
              amount: order.amount,
              eventTitle,
              organizer,
              createdAt: new Date().toISOString(),
            });
            alert(
              `Payment verified and saved for "${eventTitle}". Payment ID: ${response.razorpay_payment_id}`
            );
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
