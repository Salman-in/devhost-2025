import Events from "@/components/Events";
import { verifySessionCookie } from "@/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EventsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;
  if (!session) redirect("/");

  try {
    await verifySessionCookie(session);
  } catch {
    redirect("/");
  }

  return <Events />;
}
