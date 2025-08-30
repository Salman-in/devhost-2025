"use server";

import { adminDb } from "@/firebase/admin";

 // Check which emails are NOT registered users by querying Firestore.

export async function checkRegisteredEmails(emails: string[]): Promise<string[]> {
  const usersRef = adminDb.collection("users");
  const unregistered: string[] = [];

  for (const email of emails) {
    const querySnapshot = await usersRef.where("email", "==", email).limit(1).get();
    if (querySnapshot.empty) {
      unregistered.push(email);
    }
  }
  return unregistered;
}

/**
 * Save team members for an event under the leader.
 * Throws error if already registered.
 */ 
export async function addTeamMembers(leader: string, eventId: number, emails: string[]) {
  const docRef = adminDb.collection("teamRegistrations").doc(`${leader}_${eventId}`);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    throw new Error("You have already registered this team for the event.");
  }

  await docRef.set({
    leader,
    eventId,
    members: emails,
    registeredAt: new Date().toISOString(),
  });
}


export async function checkAlreadyRegistered(leader: string, eventId: number): Promise<boolean> {
  const docRef = adminDb.collection("teamRegistrations").doc(`${leader}_${eventId}`);
  const docSnap = await docRef.get();
  return docSnap.exists;
}


// Fetch team members for leader and event.

export async function getTeamMembersByLeaderAndEvent(leader: string, eventId: number): Promise<string[]> {
  const docRef = adminDb.collection("teamRegistrations").doc(`${leader}_${eventId}`);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return [];

  const data = docSnap.data();
  return data?.members ?? [];
}

// Fetch payment details by payment ID.

export async function getPaymentDetailsById(paymentId: string): Promise<{
  id: string;
  status: string;
  amount: number;
  created: number;
} | null> {
  const paymentRef = adminDb.collection("payments").doc(paymentId);
  const paymentSnap = await paymentRef.get();

  if (!paymentSnap.exists) return null;

  const data = paymentSnap.data();
  return {
    id: paymentId,
    status: data?.status ?? "Unknown",
    amount: data?.amount ?? 0,
    created: data?.created ?? 0,
  };
}