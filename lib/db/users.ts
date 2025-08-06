import { db } from "@/firebase/admin";

export async function getUser(userId: string) {
    const snap = await db.collection("users").doc(userId).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

export async function createUser(userId: string, data: object) {
    await db.collection("users").doc(userId).set(data);
}

export async function updateUser(userId: string, data: object) {
    await db.collection("users").doc(userId).update(data);
}
