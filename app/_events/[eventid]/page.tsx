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

  try {
    await verifySessionCookie(session);
  } catch {
    redirect("/");
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(#a3ff12 2px, transparent 1px),
              linear-gradient(90deg, #a3ff12 2px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
      <EventRegistration eventId={eventid} />
    </div>
  );
}
