import { adminAuth } from '@/firebase/admin';
import { NextRequest } from 'next/server';

export const verifyToken = async (req: NextRequest) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split('Bearer ')[1];
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};