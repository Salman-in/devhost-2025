import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { uid } = decoded;

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    return NextResponse.json(userData);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
