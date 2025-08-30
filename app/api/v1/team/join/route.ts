import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { uid, name } = decoded;

    const searchData = await req.json();
    const { leader_email } = searchData;

    if (!leader_email) {
      return NextResponse.json(
        { error: "Team leader email is required" },
        { status: 400 },
      );
    }

    // Query teams by leader email with index
    const teamsQuery = await adminDb
      .collection("teams")
      .where("team_leader_email", "==", leader_email.toLowerCase().trim())
      .where("finalized", "==", false)
      .limit(1)
      .get();

    if (teamsQuery.empty) {
      return NextResponse.json(
        { error: "Team not found or already finalized" },
        { status: 404 },
      );
    }

    const teamDoc = teamsQuery.docs[0];
    const teamRef = teamDoc.ref;
    const teamData = teamDoc.data();
    const team_id = teamData.team_id;

    await teamRef.update({
      peers: FieldValue.arrayUnion({ id: uid, name: name }),
      updatedAt: new Date().toISOString(),
    });

    // Update user's team_id
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.update({
      team_id: team_id,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `${uid} joined team ${team_id} successfully`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
