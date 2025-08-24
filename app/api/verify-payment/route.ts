import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/firebase/admin";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      event_id,
      user_email,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing RAZORPAY_KEY_SECRET" },
        { status: 500 }
      );
    }

    const normalizedEmail =
      typeof user_email === "string" ? user_email.trim().toLowerCase() : undefined;
    const eventIdStr =
      event_id !== undefined && event_id !== null
        ? String(event_id).trim()
        : undefined;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const rz = new Razorpay({ key_id, key_secret });

    const orderInfo = await rz.orders.fetch(razorpay_order_id);

    // Fix here: convert to string before toLowerCase
    if (
      (orderInfo.notes?.event_id && orderInfo.notes.event_id !== eventIdStr) ||
      (orderInfo.notes?.user_email &&
        orderInfo.notes.user_email.toString().toLowerCase() !== normalizedEmail)
    ) {
      return NextResponse.json(
        { error: "Order context mismatch" },
        { status: 400 }
      );
    }

    await adminDb
      .collection("payments")
      .doc(razorpay_payment_id)
      .set(
        {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          status: "Paid",
          amount: amount || null,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

    const registrationsRef = adminDb.collection("event_registrations");

    if (!normalizedEmail || event_id === undefined || event_id === null) {
      return NextResponse.json(
        {
          warning:
            "Registration context missing, payment recorded but registration not updated",
        },
        { status: 200 }
      );
    }

    const querySnapshot = await registrationsRef
      .where("event_id", "==", Number(event_id))
      .where("participants", "array-contains", normalizedEmail)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        {
          warning:
            "Registration not found for given event_id and email, payment recorded",
        },
        { status: 200 }
      );
    }

    const docId = querySnapshot.docs[0].id;
    await registrationsRef.doc(docId).update({
      paymentStatus: "Paid",
      paymentDetails: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paidAt: new Date().toISOString(),
        amount: amount || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
