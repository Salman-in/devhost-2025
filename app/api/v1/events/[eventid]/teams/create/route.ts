import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventid: string } },
) {
  const decoded = await verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const { email } = decoded;
  const eventId = params.eventid;

  const teamsRef = adminDb
    .collection("registrations")
    .doc(eventId)
    .collection("teams");

  // Check if user is already in a team
  const existingTeams = await teamsRef
    .where("members", "array-contains", email)
    .get();

  if (!existingTeams.empty) {
    return NextResponse.json(
      { error: "User is already in a team for this event" },
      { status: 400 },
    );
  }

  // Create new team
  const newTeamRef = teamsRef.doc();
  await newTeamRef.set({
    leaderEmail: email,
    members: [email],
    paymentDone: false,
    registered: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ teamId: newTeamRef.id });
}
