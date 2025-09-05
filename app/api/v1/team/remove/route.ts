import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { email } = decoded;

    const searchData = await req.json();
    const { team_id, member_email } = searchData;

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
          error: "Only team leaders can remove members",
        },
        { status: 403 },
      );
    }

    // Remove the member from the team
    await teamRef.update({
      members: FieldValue.arrayRemove({
        email: member_email,
        role: "member",
      }),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `${member_email} removed from team successfully`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
