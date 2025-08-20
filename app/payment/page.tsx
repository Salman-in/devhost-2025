"use client";

import { useSearchParams } from "next/navigation";
import PaymentButton from "../../components/PaymentButton";

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const title = searchParams.get("title") || "";
  const organizer = searchParams.get("organizer") || "";
  const eventId = searchParams.get("eventId") || "";
  const userEmail = searchParams.get("userEmail") || "";
  const baseAmount = Number(searchParams.get("amount")) || 10000;
  const taxAmount = Math.round(baseAmount * 0.05);
  const totalAmount = baseAmount + taxAmount;

  // Optional validation: display error if eventId or userEmail missing
  if (!eventId || !userEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Missing event or user details for payment.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment for {title}</h1>
        <p className="mb-2 text-gray-300">Organizer: {organizer}</p>
        <p className="mb-1 text-lg">Base Amount: ₹{(baseAmount / 100).toFixed(2)}</p>
        <p className="mb-1 text-lg text-yellow-400">+ Tax: ₹{(taxAmount / 100).toFixed(2)}</p>
        <p className="mb-6 text-lg font-semibold text-green-400">
          Total Payable: ₹{(totalAmount / 100).toFixed(2)}
        </p>

        <PaymentButton
          amount={totalAmount}
          eventTitle={title}
          organizer={organizer}
          eventId={eventId}
          userEmail={userEmail}
        />
      </div>
    </div>
  );
}
