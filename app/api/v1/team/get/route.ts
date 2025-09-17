import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { email } = decoded;

    // Check if team_id is provided as query parameter
    const url = new URL(req.url);
    const teamIdParam = url.searchParams.get("team_id");

    if (teamIdParam) {
      // Direct team access with ID
      const teamRef = adminDb.collection("teams").doc(teamIdParam);
      const teamSnap = await teamRef.get();

      if (!teamSnap.exists) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      const teamData = teamSnap.data();
      return NextResponse.json(teamData);
    } else {
      // Find team by user's email
      const teamsRef = adminDb.collection("teams");
      const teamsSnap = await teamsRef.get();

      if (teamsSnap.empty) {
        return NextResponse.json({ error: "No teams found" }, { status: 404 });
      }

      // Find the team where the user is either a leader or a member
      let userTeam = null;

      for (const doc of teamsSnap.docs) {
        const team = doc.data();

        // Check if user is team leader
        if (team.team_leader_email === email) {
          userTeam = team;
          break;
        }

        // Check if user is team member
        if (
          team.members &&
          team.members.some(
            (member: { email: string }) => member.email === email,
          )
        ) {
          userTeam = team;
          break;
        }
      }

      if (!userTeam) {
        return NextResponse.json(
          { error: "User is not part of any team" },
          { status: 404 },
        );
      }

      return NextResponse.json(userTeam);
    }
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
