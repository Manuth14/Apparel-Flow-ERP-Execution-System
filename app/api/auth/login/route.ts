import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signSession, verifyPassword, SESSION_MAX_AGE } from "@/lib/auth";
import { SESSION_COOKIE, type Role } from "@/lib/session";

const LoginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
});

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);

    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    let ok = false;
    if (user?.passwordHash.startsWith("$2")) {
        ok = await verifyPassword(password, user.passwordHash);
    } else {
        ok = password === user?.passwordHash;
    }

    if (!user || !ok) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signSession({
        id: user.id,
        role: user.role as Role,
        fullName: user.fullName,
    });

    const res = NextResponse.json({ role: user.role, fullName: user.fullName });
    res.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    });
    return res;
}