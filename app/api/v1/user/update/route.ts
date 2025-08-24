import { adminDb } from "@/firebase/admin";
import { adminAuth } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { uid } = decoded;

    const body = await req.json();
    const ProfileSchema = z.object({
      name: z.string().trim().min(1).max(100),
      email: z.string().trim().email(),
      phone: z.string().trim().max(20).optional().default(""),
      college: z.string().trim().max(100).optional().default(""),
      branch: z.string().trim().max(100).optional().default(""),
      year: z.coerce.number().int().min(1).max(8),
      bio: z.string().trim().max(500).optional().default(""),
    });
    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile data" },
        { status: 400 }
      );
    }
    const { name, email, phone, college, branch, year, bio } = parsed.data;

    const userRef = adminDb.collection("users").doc(uid);
    await userRef.update({
      name,
      email: email.toLowerCase(),
      phone,
      college,
      branch,
      year,
      updatedAt: new Date().toISOString(),
    });

    // Update Firebase Auth displayName and custom claims
    await adminAuth.updateUser(uid, {
      displayName: name,
    });

    // Set custom claims with updated user data to refresh token
    await adminAuth.setCustomUserClaims(uid, {
      name: name,
      email: email.toLowerCase(),
      phone: phone,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      refreshToken: true,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
