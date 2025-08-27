"use server";

import { adminDb } from "@/firebase/admin";
import { redirect } from "next/navigation";

export async function addAndSendInvites(leader: string, eventId: number, emails: string[]) {
  if (emails.length === 0) throw new Error("Please provide at least one member email.");

  const invitesToSave = emails.map(email => ({ email, accepted: false }));

  const docRef = adminDb.collection("teamInvites").doc(`${leader}_${eventId}`);
  await docRef.set({ invites: invitesToSave }, { merge: true });
}

export async function registerAction(canRegister: boolean, eventId: number, leader: string) {
  if (!canRegister) throw new Error("All members must accept invites before registering.");
  redirect(`/payment?event=${eventId}&leader=${leader}`);
}