import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminDb, verifySessionCookie } from '@/firebase/admin';
import ProfileClient from '@/components/ProfileClient';

interface Profile {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: number;
  team_id?: string;
}

export default async function ProfilePage() {
  // 1. Verify session cookie
  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;
  if (!session) redirect('/');

  let uid: string;
  try {
    const decoded = await verifySessionCookie(session);
    uid = decoded.uid;
  } catch {
    redirect('/');
  }

  // 2. Fetch user profile directly from Firestore
  const userSnap = await adminDb.collection('users').doc(uid).get();
  if (!userSnap.exists) {
    // No profile yet → send to details page
    redirect('/details');
  }
  const profile = userSnap.data() as Profile;

  // 3. Redirect if profile incomplete
  if (!profile.phone || !profile.college || !profile.branch) {
    redirect('/details');
  }

  // 4. Render profile page
  return <ProfileClient profile={profile} />;
}
