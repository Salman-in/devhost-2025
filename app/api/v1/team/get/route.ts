import { adminDb } from '@/firebase/admin';
import { verifyToken } from '@/lib/verify-token';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const decoded = await verifyToken(req);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { uid } = decoded;

        // Check if team_id is provided as query parameter (optimization)
        const url = new URL(req.url);
        const teamIdParam = url.searchParams.get('team_id');

        let teamId: string;

        if (teamIdParam) {
            teamId = teamIdParam;
        } else {
            const userRef = adminDb.collection('users').doc(uid);
            const userSnap = await userRef.get();

            if (!userSnap.exists) {
                return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
            }

            const userData = userSnap.data();
            teamId = userData?.team_id;
        }

        if (!teamId || teamId === "") {
            return NextResponse.json({ error: 'User is not part of any team' }, { status: 404 });
        }

        const teamRef = adminDb.collection('teams').doc(teamId);
        const teamSnap = await teamRef.get();

        if (!teamSnap.exists) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const teamData = teamSnap.data();
        return NextResponse.json(teamData);
    } catch (err) {
        console.error('API error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
