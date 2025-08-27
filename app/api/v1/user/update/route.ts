import { adminDb, verifySessionCookie } from '@/firebase/admin';
import { adminAuth } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
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

    const profileData = await req.json();
    const { name, email, phone, college, branch, year } = profileData;

    const userRef = adminDb.collection('users').doc(uid);
    await userRef.update({
      name,
      phone,
      college,
      branch,
      year,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase Auth displayName and custom claims
    await adminAuth.updateUser(uid, {
      displayName: name,
    });

    // Set custom claims with updated user data to refresh token
    await adminAuth.setCustomUserClaims(uid, {
      name: name,
      email: email,
      phone: phone,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      refreshToken: true // Signal client to refresh token
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
