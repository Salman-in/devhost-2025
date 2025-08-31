import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { verifyToken } from "@/lib/verify-token";

/*
  TODO: CHANGE THIS TO USE RAZER PAY
*/

export async function POST(
  req: NextRequest,
  { params }: { params: { eventid: string; teamid: string } },
) {
  const decoded = await verifyToken(req);
  if (!decoded)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const eventId = params.eventid;
  const teamId = params.teamid;

  const ref = adminDb
    .collection("registrations")
    .doc(eventId)
    .collection("teams")
    .doc(teamId);

  await ref.update({ paymentDone: true, registered: true });

  return NextResponse.json({ success: true });
}
