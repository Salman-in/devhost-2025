import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { name, email } = decoded;

    const searchData = await req.json();
    const { leader_email } = searchData;

    if (!leader_email) {
      return NextResponse.json(
        { error: "Team leader email is required" },
        { status: 400 },
      );
    }
    
    // Check if user is already in a team
    const allTeamsQuery = await adminDb.collection("teams").get();
    const allTeams = allTeamsQuery.docs.map(doc => doc.data());
    
    const userInTeam = allTeams.find(team => 
      team.team_leader_email === email || 
      team.members?.some((member: { email: string }) => member.email === email)
    );
    
    if (userInTeam) {
      return NextResponse.json(
        { error: "You are already part of a team" },
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

    await teamRef.update({
      members: FieldValue.arrayUnion({ name, email, role: 'member' }),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `${name} joined team successfully`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
