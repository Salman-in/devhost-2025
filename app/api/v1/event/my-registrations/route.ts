import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import admin from "@/firebase/admin";
import { getFirestore } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user email
    const decodedToken = await getAuth(admin.app()).verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Firestore instance
    const firestore = getFirestore(admin.app());
    const registrationsRef = firestore.collection("event_registrations");

    // Fetch registrations where user is leader
    const leaderSnapshot = await registrationsRef
      .where("leader_email", "==", email)
      .get();

    // Fetch registrations where user is participant
    const participantSnapshot = await registrationsRef
      .where("participants", "array-contains", email)
      .get();

    // Merge results without duplicates
    const registrationsMap = new Map();

    leaderSnapshot.forEach((doc) => {
      registrationsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    participantSnapshot.forEach((doc) => {
      registrationsMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Convert to array and normalize createdAt date
    const registrations = Array.from(registrationsMap.values()).map((reg) => ({
      event_id: reg.event_id,
      type: reg.type,
      leader_email: reg.leader_email,
      participants: reg.participants,
      createdAt: reg.createdAt?.toDate
        ? reg.createdAt.toDate().toISOString()
        : reg.createdAt,
      paymentStatus: reg.paymentStatus || "Pending",
      paymentDetails: reg.paymentDetails || null,
    }));

    return NextResponse.json({ registrations });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
