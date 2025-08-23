import { NextRequest, NextResponse } from "next/server";
import {adminDb,adminAuth} from "../../../../../firebase/admin";
import { z } from "zod";

const eventRegistrationSchema = z.object({
  event_id: z
    .union([z.string(), z.number()])
    .transform((val) => val.toString()),
  leader_email: z.string().email(),
  type: z.enum(["team", "individual"]),
  members: z.array(z.string().email()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedToken = await adminAuth.verifyIdToken(token);
    const authEmail = decodedToken.email;
    if (!authEmail)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = eventRegistrationSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.issues },
        { status: 400 }
      );

    const { event_id, leader_email, type, members } = parsed.data;

    if (authEmail.toLowerCase() !== leader_email.toLowerCase())
      return NextResponse.json(
        {
          error:
            "You must be logged in with the team leader's email for registration.",
        },
        { status: 403 }
      );

    const registrations = adminDb.collection("event_registrations");

    const existing = await registrations
      .where("event_id", "==", event_id)
      .where("participants", "array-contains", leader_email)
      .get();

    if (!existing.empty)
      return NextResponse.json(
        { error: "Already registered" },
        { status: 400 }
      );

    // Validate all team member emails are registered users
    if (type === "team") {
      const usersSnap = await adminDb.collection("users").get();
      const validEmailsSet = new Set(
        usersSnap.docs
          .map((doc) => doc.data().email?.toLowerCase())
          .filter(Boolean)
      );
      for (const email of members) {
        if (!validEmailsSet.has(email.toLowerCase()))
          return NextResponse.json(
            {
              error: `${email} is not registered via Google OAuth on this site.`,
            },
            { status: 400 }
          );
        const memberCheck = await registrations
          .where("event_id", "==", event_id)
          .where("participants", "array-contains", email)
          .get();
        if (!memberCheck.empty)
          return NextResponse.json(
            { error: `${email} already registered` },
            { status: 400 }
          );
      }
    }

    await registrations.add({
      event_id,
      leader_email,
      participants:
        type === "team" ? [leader_email, ...members] : [leader_email],
      createdAt: new Date(),
      paymentStatus: "pending",
      paymentDetails: null,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
