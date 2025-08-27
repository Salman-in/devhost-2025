import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionCookie } from '@/firebase/admin';
import DetailsClient from '@/components/DetailsClient';

export default async function DetailsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;

  if (!session) redirect('/');

  const decoded = await verifySessionCookie(session);
  if (!decoded) redirect('/');

  // Extract user info from session only, no DB checks
  const { email, name } = decoded;

  // Pass minimal user info from session to form component
  const initialProfile = {
    email: email || '',
    name: name || '',
    phone: '',
    college: '',
    branch: '',
    year: 1,
  };

  return <DetailsClient profile={initialProfile} />;
}
