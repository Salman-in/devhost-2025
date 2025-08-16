import { adminDb } from '@/firebase/admin';
import { verifyToken } from '@/lib/verify-token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { uid } = decoded;

    const profileData = await req.json();
    const { name, email, phone, college, branch, year, bio } = profileData;

    const userRef = adminDb.collection('users').doc(uid);
    await userRef.update({
      name,
      email,
      phone,
      college,
      branch,
      year,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}