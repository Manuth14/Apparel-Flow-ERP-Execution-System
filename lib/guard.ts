import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ROLE_HOME, type Role } from "@/lib/roles";

/**
 * Use in a role's layout.tsx. Not logged in -> login page.
 * Logged in with another role -> that role's own home page.
 */
export async function requirePageRole(role: Role) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== role) redirect(ROLE_HOME[session.role]);
  return session;
}
