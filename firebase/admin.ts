import admin, { ServiceAccount } from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { Auth } from 'firebase-admin/auth';
import { Firestore } from 'firebase-admin/firestore';

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: privateKey!,
};

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  adminDb = admin.firestore();
  adminAuth = admin.auth();
} else {
  app = admin.apps[0]!;
  adminDb = admin.firestore(app);
  adminAuth = admin.auth(app);
}

export async function createSessionCookie(idToken: string, expiresIn: number) {
  return adminAuth.createSessionCookie(idToken, { expiresIn });
}

export async function verifySessionCookie(session: string) {
  return adminAuth.verifySessionCookie(session, true);
}

export { adminDb, adminAuth };
export default admin;
