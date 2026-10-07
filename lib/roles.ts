export type Role = "cutting_supervisor" | "cutting_verifier" | "sewing_supervisor";

export const ROLE_HOME: Record<Role, string> = {
  cutting_supervisor: "/supervisor",
  cutting_verifier: "/verifier",
  sewing_supervisor: "/sewing",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && value in ROLE_HOME;
}

export function canAccessPath(role: Role, pathname: string): boolean {
  const base = ROLE_HOME[role];
  return pathname === base || pathname.startsWith(base + "/");
}
