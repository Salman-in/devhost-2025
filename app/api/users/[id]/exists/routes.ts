import { NextResponse } from "next/server";
import { auth } from "@/firebase/admin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        await auth.getUser(params.id);
        return NextResponse.json({ exists: true });
    } catch (error: any) {
        if (error.code === "auth/user-not-found") {
            return NextResponse.json({ exists: false }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

