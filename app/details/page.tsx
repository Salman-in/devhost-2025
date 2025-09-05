import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminDb, verifySessionCookie } from "@/firebase/admin";
import DetailsClient from "@/components/backend/DetailsClient";
import { Profile } from "@/components/backend/ProfileForm";

export default async function DetailsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) redirect("/");

  const decoded = await verifySessionCookie(session);
  if (!decoded) redirect("/");

  // Extract user info from session only, no DB checks
  const { email, name, uid } = decoded;

  // Pass minimal user info from session to form component
  const initialProfile = {
    email: email || "",
    name: name || "",
    phone: "",
    college: "",
    branch: "",
    year: null,
  };

  const userSnap = await adminDb.collection("users").doc(uid).get();
  const profile = userSnap.data() as Profile;
  if (userSnap.exists) {
    if (profile.phone && profile.college && profile.branch) {
      redirect("/profile");
    }
  }

  // 3. Redirect if profile incomplete

  return <DetailsClient profile={initialProfile} />;
}
