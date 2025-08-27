import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionCookie } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });

    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days
    //creating the cookie using firebase admin using the token id from client
    const sessionCookie = await createSessionCookie(idToken, expiresIn);

    (await cookies()).set({
      name: '__session',
      value: sessionCookie,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(expiresIn / 1000),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
