import { getSession, type Role, type Session } from "@/lib/session";
import { ApiError } from "@/lib/errors";

/**
 * The real security boundary. Call this first in every protected route.
 * 401 = no valid session, 403 = valid session but the wrong role.
 */
export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Not authenticated.");
  if (!roles.includes(session.role)) {
    throw new ApiError(403, "Forbidden: your role cannot perform this action.");
  }
  return session;
}
