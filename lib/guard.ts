import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { ROLE_HOME, type Role } from "@/lib/roles";

export async function requirePageRole(role: Role) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== role) redirect(ROLE_HOME[session.role]);
  return session;
}
