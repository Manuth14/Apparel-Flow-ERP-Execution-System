import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import type { Role } from "@/lib/session";

export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export function hashPassword(plain: string) {
    return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
}

export async function signSession(user: { id: string; role: Role; fullName: string }) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    return new SignJWT({ role: user.role, fullName: user.fullName })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE}s`)
        .sign(new TextEncoder().encode(secret));
}