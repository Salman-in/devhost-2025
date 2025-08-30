import { groupEvents } from "@/app/config/eventsConfig";
import { adminAuth } from "@/firebase/admin";
import { cookies } from "next/headers";
import GroupEventRegistration from "./GroupEventRegistration";
import { checkAlreadyRegistered } from "./actions";

interface Props {
  params: { id: string };
}

export default async function GroupEventPage({ params }: Props) {
  const { id } = params;

  // Validate event ID and fetch event details
  const eventId = Number(id);
  const event = groupEvents.find((e) => e.id === eventId);
  if (!event) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <h1 className="text-xl font-bold text-red-600">Event not found.</h1>
        <p>Please check the event link or return to the events page.</p>
      </div>
    );
  }

  // Get session cookie and verify user identity (leader email)
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value || "";
  let leader = "";
  if (token) {
    try {
      const decoded = await adminAuth.verifySessionCookie(token);
      if (decoded.email) {
        leader = decoded.email;
      }
    } catch {
      // invalid token or verification failed; leave leader empty
    }
  }

  // If not authenticated, show sign-in message
  if (!leader) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <h1 className="text-xl font-bold text-red-600">Sign-in required</h1>
        <p>You must sign in to register your group for this event.</p>
      </div>
    );
  }

  // Check if this leader already registered team for this event
  const alreadyRegistered = await checkAlreadyRegistered(leader, event.id);

  return (
    <GroupEventRegistration
      event={event}
      leader={leader}
      maxMembers={event.maxMembers ?? 3}
      alreadyRegistered={alreadyRegistered}
    />
  );
}
