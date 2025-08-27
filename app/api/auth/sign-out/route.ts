import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

//to delete the session from cookie
export async function POST() {
    (await cookies()).delete({ name: '__session', path: '/' });
    return NextResponse.json({ success: true });
}
