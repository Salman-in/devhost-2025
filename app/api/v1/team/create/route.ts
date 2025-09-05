import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Get email from decoded token
    const { uid, email } = decoded;

    if (!email) {
      return NextResponse.json(
        { error: "Email not found in token" },
        { status: 401 },
      );
    }

    // Fetch latest profile data to get the most current name
    const profileRef = adminDb.collection("users").doc(uid);
    const profileSnapshot = await profileRef.get();

    if (!profileSnapshot.exists) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    const userProfile = profileSnapshot.data();
    if (!userProfile || !userProfile.name) {
      return NextResponse.json(
        { error: "Invalid user profile data" },
        { status: 400 },
      );
    }

    const name = userProfile.name; // Get name from profile, not token

    const teamData = await req.json();
    const { team_name } = teamData;

    // Generate a unique ID for the team
    const teamRef = adminDb.collection("teams").doc();
    const teamId = teamRef.id;

    // Check if user already has a team
    const teamsQuery = await adminDb.collection("teams").get();
    const teams = teamsQuery.docs.map((doc) => doc.data());

    // Check if user is already in a team (either as leader or member)
    const existingTeam = teams.find(
      (team) =>
        team.team_leader_email === email ||
        team.members?.some(
          (member: { email: string }) => member.email === email,
        ),
    );

    if (existingTeam) {
      return NextResponse.json(
        { error: "You are already part of a team" },
        { status: 400 },
      );
    }

    await teamRef.set({
      team_id: teamId,
      team_name: team_name,
      team_leader: name,
      team_leader_email: email,
      members: [{ email, role: "leader" }],
      drive_link: "",
      finalized: false,
      shortlisted: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Team ${teamId} created successfully`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
