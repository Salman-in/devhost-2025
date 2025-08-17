"use client";
import { useSearchParams } from "next/navigation";
import PaymentButton from "../../components/PaymentButton";

export default function PaymentPage() {
  const searchParams = useSearchParams();

  const title = searchParams.get("title");
  const organizer = searchParams.get("organizer");
  const amount = Number(searchParams.get("amount")) || 10000;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Payment for {title}</h1>
        <p className="mb-2 text-gray-300">Organizer: {organizer}</p>
        <p className="mb-6 text-lg font-semibold">
          Amount: ₹{(amount / 100).toFixed(2)}
        </p>

        {/* Payment Button */}
        <PaymentButton amount={amount} eventTitle={title || ""} organizer={organizer || ""} />
      </div>
    </div>
  );
}
