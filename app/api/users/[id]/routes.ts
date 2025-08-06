import { NextResponse } from "next/server";
import { getUser, updateUser } from "@/lib/db/users";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    const user = await getUser(params.id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const user = await getUser(params.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        } else {
            try {
                await updateUser(params.id, body);
                return NextResponse.json({ message: "Profile updated" });
            } catch (updateError: any) {
                return NextResponse.json({ error: updateError.message }, { status: 500 });
            }
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
