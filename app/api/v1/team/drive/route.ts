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
    const { drive_link, team_id } = searchData;

    // Verify the user is the team leader
    const teamRef = adminDb.collection("teams").doc(team_id);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamData = teamSnap.data();

    if (teamData?.team_leader_email !== email) {
      return NextResponse.json(
        {
          error: "Only team leaders can update drive links",
        },
        { status: 403 },
      );
    }

    await teamRef.update({
      drive_link: drive_link,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Drive link updated for team successfully`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
