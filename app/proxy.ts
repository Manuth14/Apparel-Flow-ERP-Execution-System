import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ROLE_HOME, canAccessPath, isRole, type Role } from "@/lib/roles";

async function roleFromCookie(req: NextRequest): Promise<Role | null> {
  const token = req.cookies.get("session")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return isRole(payload.role) ? payload.role : null;
  } catch {
    return null;
  }
}

// NOTE: Next.js 16 uses `proxy.ts` + `export function proxy`.
// On Next.js 15 or older, rename this file to `middleware.ts` and the function to `middleware`.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await roleFromCookie(req);

  // Login page: already signed in -> go straight to your own dashboard
  if (pathname === "/") {
    return role ? NextResponse.redirect(new URL(ROLE_HOME[role], req.url)) : NextResponse.next();
  }

  // Role sections: must be signed in, and may only open their own section
  if (!role) return NextResponse.redirect(new URL("/", req.url));
  if (!canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/supervisor/:path*", "/verifier/:path*", "/sewing/:path*"],
};
