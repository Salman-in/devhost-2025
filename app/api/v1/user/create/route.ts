import { adminDb } from '@/firebase/admin';
import { verifyToken } from '@/lib/verify-token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { uid, email, name, phone } = decoded;

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({
        name,
        email,
        createdAt: new Date().toISOString(),
        branch: '',
        college: '',
        year: 1,
        team_id: ''
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}