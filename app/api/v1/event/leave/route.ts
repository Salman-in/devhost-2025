import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import admin from "@/firebase/admin"; // Make sure this exports initialized Firebase Admin SDK
import { getFirestore } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAuth(admin.app()).verifyIdToken(token);
    const email = decoded.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const firestore = getFirestore(admin.app());
    const eventsRef = firestore.collection("event_registrations");

    // Find the user's registration document for this event
    const snapshot = await eventsRef
      .where("event_id", "==", event_id)
      .where("participants", "array-contains", email)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "You are not registered for this event" }, { status: 404 });
    }

    const registrationDoc = snapshot.docs[0];
    const regData = registrationDoc.data();

    if (regData.leader_email === email) {
      // Leader leaves: delete whole registration
      await eventsRef.doc(registrationDoc.id).delete();
    } else {
      // Participant leaves: remove self from participants
      const newParticipants = (regData.participants || []).filter(
        (member: string) => member !== email
      );
      if (newParticipants.length === 0) {
        await eventsRef.doc(registrationDoc.id).delete();
      } else {
        await eventsRef.doc(registrationDoc.id).update({ participants: newParticipants });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Leave event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
