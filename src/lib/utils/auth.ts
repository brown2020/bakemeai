import type { User } from "firebase/auth";

import { clearAuthSessionCookie, setAuthSessionCookie } from "@/lib/auth-session.server";
import { clearAuthCookie } from "@/lib/utils/auth-cookies";
import { logError, logWarning } from "@/lib/utils/logger";

/**
 * Verifies the Firebase ID token and stores it in an HttpOnly session cookie.
 */
export async function setUserAuthToken(user: User): Promise<void> {
  const token = await user.getIdToken();
  const saved = await setAuthSessionCookie(token);
  if (!saved) {
    logWarning("Auth session cookie was not saved", {});
  }
}

/**
 * Clears legacy client-readable cookies and the HttpOnly session cookie.
 */
export async function clearUserAuthSession(): Promise<void> {
  clearAuthCookie();
  try {
    await clearAuthSessionCookie();
  } catch (error) {
    logError("Failed to clear auth session cookie", error, {});
  }
}
