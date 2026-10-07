// Pure module (no server imports): safe for the proxy, server layouts and client components.
export type Role = "cutting_supervisor" | "cutting_verifier" | "sewing_supervisor";

// Where each role lands after login, and the ONLY URL section it may open.
// If your supervisor dashboard lives at /dashboard, change it here (one place).
export const ROLE_HOME: Record<Role, string> = {
  cutting_supervisor: "/supervisor",
  cutting_verifier: "/verifier",
  sewing_supervisor: "/sewing",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && value in ROLE_HOME;
}

/** True when pathname is the role's section or one of its sub-pages */
export function canAccessPath(role: Role, pathname: string): boolean {
  const base = ROLE_HOME[role];
  return pathname === base || pathname.startsWith(base + "/");
}
