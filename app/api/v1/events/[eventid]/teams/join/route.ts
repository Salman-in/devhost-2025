import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { verifyToken } from "@/lib/verify-token";
import { eventDetails } from "@/assets/data/eventPayment";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventid: string }> },
) {
  const decoded = await verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { email, uid } = decoded;
  const { leaderEmail } = await req.json();
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
  const existingSnap = await registrationsRef
    .where("eventId", "==", eventId)
    .where("members", "array-contains", email)
    .get();

  if (!existingSnap.empty) {
    return NextResponse.json(
      { error: "User already registered in another team for this event" },
      { status: 400 },
    );
  }

  // Find the team with given leaderEmail
  const teamSnap = await registrationsRef
    .where("eventId", "==", eventId)
    .where("leaderEmail", "==", leaderEmail)
    .get();

  if (teamSnap.empty) {
    return NextResponse.json({ error: "No team found" }, { status: 404 });
  }

  const teamDoc = teamSnap.docs[0];
  const docRef = teamDoc.ref;
  const teamData = teamDoc.data();

  // Prevent joining if team is already registered
  if (teamData.registered) {
    return NextResponse.json(
      { error: "Cannot join a team that is already registered" },
      { status: 400 },
    );
  }

  // Check max members
  const maxMembers = eventDetails[parseInt(eventId)].max ?? 1;

  if (teamData.members.length >= maxMembers) {
    return NextResponse.json(
      { error: "Team is already full" },
      { status: 400 },
    );
  }

  // Add user to the team
  await docRef.update({
    members: FieldValue.arrayUnion(email),
  });

  return NextResponse.json({ teamId: docRef.id });
}
