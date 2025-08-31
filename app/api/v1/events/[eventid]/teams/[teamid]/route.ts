import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventid: string; teamid: string } },
) {
  const decoded = await verifyToken(req);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { eventid, teamid } = params;

  const teamRef = adminDb
    .collection("registrations")
    .doc(eventid)
    .collection("teams")
    .doc(teamid);

  const snap = await teamRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  await teamRef.delete();

  return NextResponse.json({
    success: true,
    message: `Team ${teamid} deleted successfully`,
  });
}
