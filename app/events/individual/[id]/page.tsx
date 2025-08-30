import { individualEvents } from "@/app/config/eventsConfig";
import { adminAuth, adminDb } from "@/firebase/admin";
import { cookies } from "next/headers";
import PaymentButton from "@/components/PaymentButton";
import { redirect } from "next/navigation";
import React from "react";
import BackButton from "@/components/BackButton";

interface Props {
  params: { id: string };
}

export default async function IndividualEventPage({ params }: Props) {
  const eventId = parseInt(params.id, 10);

  // Find the event by id
  const event = individualEvents.find((e) => e.id === eventId);

  // Redirect if event not found
  if (!event) {
    redirect("/events");
  }

  // Get authentication cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;

  let userEmail: string | null = null;
  let alreadyRegistered = false;

  try {
    if (token) {
      // Verify Firebase session cookie
      const decodedToken = await adminAuth.verifySessionCookie(token, true);
      if (decodedToken.email) {
        userEmail = decodedToken.email;

        // Check if user already registered with completed payment for this event
        const registrationRef = await adminDb
          .collection("registrations")
          .where("eventId", "==", eventId)
          .where("userEmail", "==", userEmail)
          .where("paymentStatus", "==", "paid")
          .limit(1)
          .get();

        if (!registrationRef.empty) {
          alreadyRegistered = true;
        }
      }
    }
  } catch (error) {
    console.error("Token verification error:", error);
  }

  // If user not authenticated, redirect to login/profile
  if (!userEmail) {
    redirect("/profile");
  }

  return (
    <div className="relative mx-auto max-w-xl py-12 text-center">
      <BackButton />
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="mt-4 text-lg text-gray-600">{event.description}</p>
      {alreadyRegistered ? (
        <div className="mt-8">
          <p className="font-semibold text-green-600">
            ✅ You have already registered for this event.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <p className="mb-2 text-sm text-gray-500">
            Signed in as: {userEmail}
          </p>
          <PaymentButton
            amount={event.price * 100}
            leader={userEmail}
            eventId={eventId}
            eventName={event.title}
          />
        </div>
      )}
    </div>
  );
}
