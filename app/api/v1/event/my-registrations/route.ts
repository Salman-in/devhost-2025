import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminAuth } from "@/firebase/admin"; 

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : undefined;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const registrationsRef = adminDb.collection("event_registrations");

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
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}