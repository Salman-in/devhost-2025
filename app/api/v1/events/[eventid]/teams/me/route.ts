import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventid: string } },
) {
  const decoded = await verifyToken(req);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { email } = decoded;

  const eventId = params.eventid;

  const teamsRef = adminDb
    .collection("registrations")
    .doc(eventId)
    .collection("teams");

  const snap = await teamsRef.where("members", "array-contains", email).get();

  if (snap.empty) {
    return NextResponse.json({ team: null });
  }

  return NextResponse.json({
    team: { id: snap.docs[0].id, ...snap.docs[0].data() },
  });
}
