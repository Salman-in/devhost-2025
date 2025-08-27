import { groupEvents } from "@/app/config/eventsConfig";
import { adminAuth, adminDb } from "@/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GroupEventRegistration from "@/app/events/group/[id]/GroupEventRegistration";

interface Props {
  params: { id: string };
}

export default async function GroupEventPage({ params }: Props) {
  const { id } = params;
  const eventId = parseInt(id);
  const event = groupEvents.find((e) => e.id === eventId);
  if (!event) redirect("/events");

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value || "";
  console.log("Session token:", token);
  console.log("All cookies:", cookieStore.getAll().map(c => ({ name: c.name, value: c.value ,leader: c.value === token})));

  let leader = "guest@example.com";
  try {
    if (token) {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.email) leader = decodedToken.email;
    }
  } catch (e) {
    console.error("Token verification failed", e);
  }

  const docRef = adminDb.collection("teamInvites").doc(`${leader}_${event.id}`);
  const docSnap = await docRef.get();
  const invites = docSnap.exists ? (docSnap.data()?.invites ?? []) : [];

  const acceptedCount = invites.filter((i: any) => i.accepted).length;
  const maxMembers = event.maxMembers ?? 3;

  return (
    <GroupEventRegistration
      event={event}
      leader={leader}
      invites={invites}
      maxMembers={maxMembers}
      acceptedCount={acceptedCount}
    />
  );
}
