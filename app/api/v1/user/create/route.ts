import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { uid, email, name, phone } = decoded;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing user information" },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnap = await userRef.get();

    // Create user document if it doesn’t exist
    if (!userSnap.exists) {
      await userRef.set({
        name: name || "",
        email: email.toLowerCase(),
        phone: phone || "",
        branch: "",
        college: "",
        year: 1,
        team_id: "",
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
