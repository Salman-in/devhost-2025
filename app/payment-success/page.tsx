"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get event title from query param if needed
  const eventTitle = searchParams.get("title") || "Event";

  // Redirect to signin if user not logged in
  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
  }, [user, router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  const leaderEmail = user.email || "Unknown";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-green-50 text-black">
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="mb-2 text-lg">
        Thank you for registering for <strong>{eventTitle}</strong>.
      </p>
      <p className="mb-6">
        Registered as Team Leader: <strong>{leaderEmail}</strong>
      </p>

      <Button onClick={() => router.push("/events")}>Back to Events</Button>
    </div>
  );
}
