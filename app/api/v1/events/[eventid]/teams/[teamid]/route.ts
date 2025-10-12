import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventid: string; teamid: string }> },
) {
  const decoded = await verifyToken(req);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { eventid, teamid } = await params;

  const teamRef = adminDb.collection("registrations").doc(teamid);
  const snap = await teamRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const teamData = snap.data();
  if (!teamData || teamData.eventId !== eventid) {
    return NextResponse.json(
      { error: "Team does not belong to this event" },
      { status: 400 },
    );
  }

  await teamRef.delete();

  return NextResponse.json({
    success: true,
    message: `Team ${teamid} deleted successfully`,
  });
}
