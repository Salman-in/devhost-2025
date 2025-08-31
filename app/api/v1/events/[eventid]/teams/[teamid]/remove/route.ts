import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventid: string; teamid: string } },
) {
  const decoded = await verifyToken(req);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { memberEmail } = await req.json();
  const { eventid, teamid } = params;

  if (!memberEmail)
    return NextResponse.json({ error: "Missing memberEmail" }, { status: 400 });

  const teamRef = adminDb
    .collection("registrations")
    .doc(eventid)
    .collection("teams")
    .doc(teamid);

  const teamDoc = await teamRef.get();
  if (!teamDoc.exists)
    return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const team = teamDoc.data();

  // Only leader can remove
  if (team?.leaderEmail !== decoded.email) {
    return NextResponse.json(
      { error: "Only the team leader can remove members" },
      { status: 403 },
    );
  }

  // Prevent removal if team is registered
  if (team?.registered) {
    return NextResponse.json(
      { error: "Cannot remove members from a registered team" },
      { status: 400 },
    );
  }

  // Member must exist
  if (!team || !team.members.includes(memberEmail)) {
    return NextResponse.json(
      { error: "Member not found in team" },
      { status: 400 },
    );
  }

  // Remove member
  const updatedMembers = team.members.filter((m: string) => m !== memberEmail);
  await teamRef.update({ members: updatedMembers });

  return NextResponse.json({ members: updatedMembers });
}
