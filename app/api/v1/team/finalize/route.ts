import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { email } = decoded;
    
    const searchData = await req.json();
    const { team_id } = searchData;

    // Verify the user is the team leader
    const teamRef = adminDb.collection("teams").doc(team_id);
    const teamSnap = await teamRef.get();
    
    if (!teamSnap.exists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    
    const teamData = teamSnap.data();
    
    if (teamData?.team_leader_email !== email) {
      return NextResponse.json({ 
        error: "Only team leaders can finalize teams" 
      }, { status: 403 });
    }
    
    // Check team requirements
    if (
      Array.isArray(teamData?.members) &&
      teamData.members.length >= 3 && // Including leader (min total 3)
      teamData.members.length <= 4 && // Including leader (max total 4)
      teamData?.drive_link && 
      teamData.drive_link !== ""
    ) {
      await teamRef.update({
        finalized: true,
        updatedAt: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: "Need to upload drive link and need 3-4 team members (including leader)" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Team ${team_id} finalized successfully`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
