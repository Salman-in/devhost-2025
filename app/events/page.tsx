import Events from "@/components/Events";
import { verifySessionCookie } from "@/firebase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EventsPage() {
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
    <div className="container mx-auto py-10">
      <Events />
    </div>
  );
}
