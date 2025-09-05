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

    // Check if user is team leader
    const teamRef = adminDb.collection("teams").doc(team_id);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamData = teamSnap.data();

    if (teamData?.team_leader_email !== email) {
      return NextResponse.json(
        {
          error: "Only team leaders can delete teams",
        },
        { status: 403 },
      );
    }

    // Delete the team
    await teamRef.delete();

    return NextResponse.json({
      success: true,
      message: `Team ${team_id} deleted successfully`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
