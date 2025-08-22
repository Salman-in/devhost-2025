import { adminDb } from "@/firebase/admin";
import { NextResponse } from "next/server";

// To get registered users
export async function GET() {
  try {
    const snapshot = await adminDb.collection("users").get();

    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
