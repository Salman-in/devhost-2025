import { individualEvents } from "@/app/config/eventsConfig";
import { adminAuth } from "@/firebase/admin"; 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function IndividualEventPage({ params }: Props) {
  const eventId = parseInt(params.id);
  const event = individualEvents.find((e) => e.id === eventId);

  if (!event) {
    redirect("/events");
    return null;
  }

  // Extract the Firebase ID token from cookies (adjust cookie name if different)
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  let userEmail = "guest@example.com";

  try {
    if (token) {
      // Verify ID token with Firebase Admin SDK to get user info securely server-side
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.email) {
        userEmail = decodedToken.email;
      }
    }
  } catch (error) {
    console.error("Error verifying token:", error);
  }

   const currentEventId = event.id;

  // Next.js Server Action to handle form submission and redirect
  async function register() {
    "use server";
    if (!currentEventId) {
      throw new Error("Event ID is missing");
    }
    redirect(`/payment?event=${currentEventId}&email=${userEmail}`);
  }

  return (
    <div className="max-w-lg mx-auto py-10 text-center">
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="mt-4">{event.description}</p>
      <p className="mt-2 text-sm text-gray-500">Signed in as: {userEmail}</p>

      <form action={register}>
        <button type="submit" className="mt-6 bg-green-400 px-6 py-2 text-black font-bold">
          Register & Pay
        </button>
      </form>
    </div>
  );
}
