import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ eventid: string }> },
) {
  const decoded = await verifyToken(req);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { email } = decoded;
  const { eventid } = await context.params;

  const registrationsRef = adminDb.collection("registrations");

  // Query flat structure: direct doc with eventId and members array
  const snap = await registrationsRef
    .where("eventId", "==", eventid)
    .where("members", "array-contains", email)
    .get();

  if (snap.empty) {
    return NextResponse.json({ team: null });
  }

  const teamDoc = snap.docs[0];
  return NextResponse.json({
    team: { id: teamDoc.id, ...teamDoc.data() },
  });
}
