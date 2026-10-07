import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const SESSION_COOKIE = "session";

export type Role = "cutting_supervisor" | "cutting_verifier" | "sewing_supervisor";

export type Session = {
    userId: string;
    role: Role;
    fullName: string;
};

function secret() {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error("JWT_SECRET is not set");
    return new TextEncoder().encode(s);
}

// Reads and verifies the JWT cookie. Returns null if missing or invalid.
// Identity always comes from here, never from the request body.
export async function getSession(): Promise<Session | null> {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secret());
        return {
            userId: String(payload.sub),
            role: payload.role as Role,
            fullName: String(payload.fullName ?? ""),
        };
    } catch {
        return null;
    }
}