import { adminDb } from '@/firebase/admin';
import { verifyToken } from '@/lib/verify-token';
import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const decoded = await verifyToken(req);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { uid } = decoded;

        const searchData = await req.json();
        const { peer_id, peer_name } = searchData;

        const teamRef = adminDb.collection('teams').doc(uid);
        await teamRef.update({
            peers: FieldValue.arrayRemove({ id: peer_id, name: peer_name })
        });

        const userRef = adminDb.collection('users').doc(peer_id);
        await userRef.update({
            team_id: '',
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: `${peer_id} removed from team ${uid} successfully`
        });
    } catch (err) {
        console.error('API error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
