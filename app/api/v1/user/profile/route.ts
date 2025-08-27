import { adminDb, verifySessionCookie } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('__session')?.value;

    if (!session) {
      return NextResponse.json({ error: 'Missing session cookie' }, { status: 401 });
    }
    const decoded = await verifySessionCookie(session);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid session cookie' }, { status: 401 });
    }

    const { uid } = decoded;

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    return NextResponse.json(userData);
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
