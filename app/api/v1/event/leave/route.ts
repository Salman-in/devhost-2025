import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminAuth } from "@/firebase/admin";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email;
    const normEmail = email?.trim().toLowerCase();
    if (!normEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event_id } = body;

    if (event_id === undefined || event_id === null) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const eventsRef = adminDb.collection("event_registrations");

    // Use event_id as number directly in query
    const snapshot = await eventsRef
      .where("event_id", "==", event_id)
      .where("participants", "array-contains", normEmail)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "You are not registered for this event" },
        { status: 404 }
      );
    }

    const registrationDoc = snapshot.docs[0];
    const regData = registrationDoc.data();

    if (regData.leader_email === normEmail) {
      // Leader leaves: delete whole registration
      await eventsRef.doc(registrationDoc.id).delete();
    } else {
      // Participant leaves: remove self atomically
      const afterRemoveCount = (regData.participants || []).filter(
        (member: string) => member !== normEmail
      ).length;

      if (afterRemoveCount === 0) {
        await eventsRef.doc(registrationDoc.id).delete();
      } else {
        await eventsRef
          .doc(registrationDoc.id)
          .update({ participants: FieldValue.arrayRemove(normEmail) });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
