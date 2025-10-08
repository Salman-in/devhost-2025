// pages/api/v1/events/[eventid]/teams/[teamid]/leave.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventid: string; teamid: string }> },
) {
  const decoded = await verifyToken(req);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { eventid, teamid } = await params;
  const memberEmail = decoded.email;

  const teamRef = adminDb.collection("registrations").doc(teamid);
  const teamDoc = await teamRef.get();

  if (!teamDoc.exists)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const team = teamDoc.data();

  // Verify team belongs to this event
  if (!team || team.eventId !== eventid) {
    return NextResponse.json(
      { error: "Team does not belong to this event" },
      { status: 400 },
    );
  }

  // Prevent leader from leaving (use disband instead)
  if (team.leaderEmail === memberEmail) {
    return NextResponse.json(
      { error: "Leader cannot leave the team. Use disband." },
      { status: 403 },
    );
  }

  // Prevent leaving if team is already registered
  if (team.registered) {
    return NextResponse.json(
      { error: "Cannot leave a registered team" },
      { status: 400 },
    );
  }

  // Member must exist
  if (!team.members.includes(memberEmail)) {
    return NextResponse.json(
      { error: "You are not a member of this team" },
      { status: 400 },
    );
  }

  // Remove member
  const updatedMembers = team.members.filter((m: string) => m !== memberEmail);
  await teamRef.update({ members: updatedMembers });

  return NextResponse.json({ members: updatedMembers });
}
