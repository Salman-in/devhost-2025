import EventRegistration from "@/components/backend/EventRegistration";
import { verifySessionCookie } from "@/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EventDetails({
  params,
}: {
  params: Promise<{ eventid: string }>;
}) {
  const { eventid } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) redirect("/");

  let uid: string;
  try {
    const decoded = await verifySessionCookie(session);
    uid = decoded.uid;
  } catch {
    redirect("/");
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#a3ff12_1px,transparent_1px),linear-gradient(to_bottom,#a3ff12_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]"></div>
      </div>
      <EventRegistration eventId={eventid} />
    </div>
  );
}
