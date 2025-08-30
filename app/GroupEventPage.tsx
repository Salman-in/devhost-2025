import { groupEvents } from "@/app/config/eventsConfig";
import { adminAuth } from "@/firebase/admin";
import { cookies } from "next/headers";
import GroupEventRegistration from "@/app/events/group/[id]/GroupEventRegistration";
import { checkAlreadyRegistered } from "@/app/events/group/[id]/actions";

interface Event {
  maxMembers?: number;
  id: number;
  title: string;
  tagline: string;
  description: string;
  date: string;
  time: string;
  organizer: string;
  contact: string;
  image: string;
  price: number; // Add price here!
}

interface Props {
  params: { id: string };
}

export default async function GroupEventPage({ params }: Props) {
  const { id } = params;
  const eventId = Number(id);
  // Tell TypeScript that events have 'price'
  const event = groupEvents.find((e) => e.id === eventId) as Event | undefined;

  if (!event) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <h1 className="text-xl font-bold text-red-600">Event not found.</h1>
        <p>Please check the event link or return to the events page.</p>
      </div>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value || "";
  let leader = "";

  if (token) {
    try {
      const decoded = await adminAuth.verifySessionCookie(token);
      if (decoded.email) leader = decoded.email;
    } catch {
      console.log("Invalid session cookie");
    }
  }

  if (!leader) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <h1 className="text-xl font-bold text-red-600">Sign-in required</h1>
        <p>You must sign in to register your group for this event.</p>
      </div>
    );
  }

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
