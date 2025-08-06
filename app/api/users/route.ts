import { NextResponse } from "next/server";
import { createUser } from "@/lib/db/users";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!body.id || !body.email || !body.displayName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        await createUser(body.id, body);
        return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/users:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

