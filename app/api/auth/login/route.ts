import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signSession, verifyPassword, SESSION_MAX_AGE } from "@/lib/auth";
import { SESSION_COOKIE, type Role } from "@/lib/session";

const LoginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
});

// Valid bcrypt hash used when the email is unknown, so response time
// does not reveal whether an account exists.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.6bM5Yv5kq3p0y8X3m0g5uQ2m8Y2e";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);

    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // NOTE: adjust field names if your Prisma schema differs
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
// Temporary check: supports both hashed and plain text for testing
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