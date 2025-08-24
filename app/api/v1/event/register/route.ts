import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../../../firebase/admin";
import { z } from "zod";
import { eventData } from "@/lib/events";

// Zod schema: event_id is number or string convertible to number (transformed to number)
const eventRegistrationSchema = z.object({
  event_id: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: "Invalid event_id" }),
  leader_email: z
    .string()
    .email()
    .transform((e) => e.trim().toLowerCase()),
  type: z.enum(["team", "individual"]),
  members: z
    .array(z.string().email())
    .optional()
    .default([])
    .transform((arr) =>
      Array.from(new Set(arr.map((e) => e.trim().toLowerCase())))
    ),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify token and normalize auth email
    const decodedToken = await adminAuth.verifyIdToken(token);
    const authEmail = decodedToken.email?.trim().toLowerCase();
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
    const eventId = event_id; // number
    const leader = leader_email;
    const memberEmails = members || [];

    // Validate event exists with numeric id
    const ev = eventData[eventId];
    if (!ev) {
      return NextResponse.json({ error: "Unknown event" }, { status: 400 });
    }

    // Enforce event type
    if (type !== ev.type) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    // Leader cannot be in members for team events
    if (ev.type === "team" && memberEmails.includes(leader)) {
      return NextResponse.json(
        { error: "Team members cannot include the leader's email." },
        { status: 400 }
      );
    }

    // Enforce team size limit
    if (ev.type === "team") {
      const max = Math.max(2, ev.maxTeamSize ?? 2);
      if (1 + memberEmails.length > max) {
        return NextResponse.json(
          { error: `Team size exceeds maximum of ${max}.` },
          { status: 400 }
        );
      }
    } else if (memberEmails.length > 0) {
      return NextResponse.json(
        { error: "Members not allowed for individual events." },
        { status: 400 }
      );
    }

    // Check auth email matches leader email
    if (authEmail !== leader) {
      return NextResponse.json(
        {
          error:
            "You must be logged in with the team leader's email for registration.",
        },
        { status: 403 }
      );
    }

    const registrations = adminDb.collection("event_registrations");

    // Check for existing registration
    const existing = await registrations
      .where("event_id", "==", eventId)
      .where("participants", "array-contains", leader)
      .get();

    if (!existing.empty)
      return NextResponse.json(
        { error: "Already registered" },
        { status: 409 }
      );

    // Validate members for team event
    if (type === "team") {
      // Query in chunks max 10 for Firestore 'in' limitation
      const chunks: string[][] = [];
      for (let i = 0; i < memberEmails.length; i += 10) {
        chunks.push(memberEmails.slice(i, i + 10));
      }

      const found = new Set<string>();
      for (const chunk of chunks) {
        const q = await adminDb
          .collection("users")
          .where("email", "in", chunk)
          .get();
        q.forEach((d) => {
          const e = d.data()?.email?.toLowerCase();
          if (e) found.add(e);
        });
      }

      const missing = memberEmails.filter((e) => !found.has(e));
      if (missing.length) {
        return NextResponse.json(
          { error: `Not registered: ${missing.join(", ")}` },
          { status: 400 }
        );
      }

      const dupQ = await registrations
        .where("event_id", "==", eventId)
        .where("participants", "array-contains-any", memberEmails)
        .get();

      if (!dupQ.empty) {
        const dupParticipants = dupQ.docs[0].data().participants || [];
        const dup = memberEmails.find((m) => dupParticipants.includes(m));
        return NextResponse.json(
          { error: `${dup} already registered` },
          { status: 409 }
        );
      }
    }

    const participants =
      type === "team"
        ? Array.from(new Set([leader, ...memberEmails]))
        : [leader];

    const docId = `${eventId}:${leader}`;
    const docRef = registrations.doc(docId);

    await docRef.create({
      event_id: eventId,
      leader_email: leader,
      participants,
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
