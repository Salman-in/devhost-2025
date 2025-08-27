import {
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';

export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const userCredential = await signInWithPopup(auth, provider);

    const idToken = await userCredential.user.getIdToken();
    await exchangeIdTokenForSession(idToken);

    return userCredential;
  } catch (error: any) {
    console.error('Google sign in error:', error);

    // Handle specific error cases
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with this email address using a different sign-in method.');
    }

    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' });
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// this is for sending the token from client to server side (to store the session as cookie in return)
export async function exchangeIdTokenForSession(idToken: string) {
  const res = await fetch('/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error('Failed to create session');
}
