import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventid: string }> },
) {
  const decoded = await verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const { email, uid } = decoded;
  const eventId = (await params).eventid;

  const profileRef = adminDb.collection("users").doc(uid);
  const profileSnapshot = await profileRef.get();

  if (!profileSnapshot.exists) {
    return NextResponse.json(
      { error: "User profile not found" },
      { status: 404 },
    );
  }

  const userProfile = profileSnapshot.data();
  if (!userProfile || !userProfile.name) {
    return NextResponse.json(
      { error: "Invalid user profile data" },
      { status: 400 },
    );
  }

  const registrationsRef = adminDb.collection("registrations");

  // Check if user is already in a team for this event
  const existingTeams = await registrationsRef
    .where("eventId", "==", eventId)
    .where("members", "array-contains", email)
    .get();

  if (!existingTeams.empty) {
    return NextResponse.json(
      { error: "User is already in a team for this event" },
      { status: 400 },
    );
  }

  // Create new team directly under registrations
  const newTeamRef = registrationsRef.doc();
  await newTeamRef.set({
    eventId,
    leaderEmail: email,
    members: [email],
    paymentDone: false,
    registered: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ teamId: newTeamRef.id });
}
