"use client";
import Script from "next/script";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

{/**Note: Add this in events button to make payment */}

export default function PaymentButton({ amount = 100 }: { amount?: number }) {
  // amount in paise. default ₹500.00 -> 50000
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
      handler: async function (response: any) {
        // Send to server to verify signature
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const verify = await verifyRes.json();
        if (verify.ok) {
          // Persist record to Firestore (quick hackathon approach)
          await setDoc(doc(db, "payments", response.razorpay_payment_id), {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            status: "paid",
            amount: order.amount,
            createdAt: new Date().toISOString(),
          });
          alert("Payment verified and saved. Payment ID: " + response.razorpay_payment_id);
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
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button onClick={startPayment}>Pay ₹{(amount / 100).toFixed(2)}</button>
    </>
  );
}


