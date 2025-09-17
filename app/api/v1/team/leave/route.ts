import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { email, name } = decoded;

    const searchData = await req.json();
    const { team_id } = searchData;

    const teamRef = adminDb.collection("teams").doc(team_id);
    const teamSnap = await teamRef.get();

    if (teamSnap.exists && !teamSnap.data()?.finalized) {
      // Check if user is leader or member
      const teamData = teamSnap.data();
      const isLeader = teamData?.team_leader_email === email;

      if (isLeader) {
        return NextResponse.json(
          {
            error:
              "Team leaders cannot leave their team. Please delete the team instead.",
          },
          { status: 400 },
        );
      }

      await teamRef.update({
        members: FieldValue.arrayRemove({ email, role: "member" }),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `${name} left team successfully`,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
