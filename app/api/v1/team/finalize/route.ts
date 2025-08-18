import { adminDb } from '@/firebase/admin';
import { verifyToken } from '@/lib/verify-token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { uid, name } = decoded;

    const teamRef = adminDb.collection('teams').doc(uid);
    await teamRef.update({
      finalized: true,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: `Team ${uid} finalized successfully`
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
