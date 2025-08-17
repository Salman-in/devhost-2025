import { adminDb } from '@/firebase/admin';
import { verifyToken } from '@/lib/verify-token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const decoded = await verifyToken(req);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { uid, name } = decoded;

        const teamData = await req.json();
        const { team_name } = teamData;

        const teamRef = adminDb.collection('teams').doc(uid);
        const teamSnap = await teamRef.get();

        if (!teamSnap.exists) {
            await teamRef.set({
                team_id: uid,
                team_name: team_name,
                team_leader: name,
                peers: [],
                drive_link: '',
                createdAt: new Date().toISOString(),
            });
        }

        const userRef = adminDb.collection('users').doc(uid);
        await userRef.update({
            team_id: uid,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, message: `Team ${uid} created successfully` });
    } catch (err) {
        console.error('API error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
