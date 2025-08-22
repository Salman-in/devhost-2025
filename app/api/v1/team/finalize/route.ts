import { adminDb } from '@/firebase/admin';
import { verifyToken } from '@/lib/verify-token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { uid, name } = decoded;

    const teamRef = adminDb.collection('teams').doc(uid);
    const teamSnap = await teamRef.get();
    const teamData = teamSnap.data();
    if (teamSnap.exists && teamData?.peers >= 3 && teamData?.peers <= 4 && teamData?.drive_link !== "") {
      await teamRef.update({
        finalized: true,
        updatedAt: new Date().toISOString(),
      });
    }
    else {
      return NextResponse.json({ error: 'Need to upload drive link (or) need at least 3 peers' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Team ${uid} finalized successfully`
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
