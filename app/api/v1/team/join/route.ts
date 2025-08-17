import { adminDb } from '@/firebase/admin';
import { verifyToken } from '@/lib/verify-token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { uid, name } = decoded;

    const searchData = await req.json();
    const { team_id } = searchData;

    const teamRef = adminDb.collection('teams').doc(team_id);
    await teamRef.update({
      peers: [{ id: uid, name: name }],
      updatedAt: new Date().toISOString(),
    });

    const userRef = adminDb.collection('users').doc(uid);
    await userRef.update({
      team_id: team_id,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: `${uid} joined team ${team_id} successfully`
    });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
