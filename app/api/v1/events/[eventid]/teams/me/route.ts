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

  const teamsRef = adminDb
    .collection("registrations")
    .doc(eventid)
    .collection("teams");

  const snap = await teamsRef.where("members", "array-contains", email).get();

  if (snap.empty) {
    return NextResponse.json({ team: null });
  }

  return NextResponse.json({
    team: { id: snap.docs[0].id, ...snap.docs[0].data() },
  });
}
