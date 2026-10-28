"use server";

import { cookies } from "next/headers";

import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
} from "@/lib/constants/auth";
import { getIdTokenCookieMaxAgeSeconds } from "@/lib/utils/jwt";
import { logWarning } from "@/lib/utils/logger";
import { verifyFirebaseIdToken } from "@/lib/utils/server-auth";

const MAX_ID_TOKEN_LENGTH = 4096;

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Stores a verified Firebase ID token in an HttpOnly cookie.
 * Lifetime follows the token exp claim and never exceeds one hour.
 * Returns false when the token cannot be verified; callers still keep the
 * Firebase client session so the UI can show a sign-in error.
 */
export async function setAuthSessionCookie(idToken: string): Promise<boolean> {
  if (!idToken || idToken.length > MAX_ID_TOKEN_LENGTH) {
    logWarning("Rejected an auth token that cannot fit in a session cookie", {});
    return false;
  }

  const verified = await verifyFirebaseIdToken(idToken);
  if (!verified) return false;

  const maxAge = getIdTokenCookieMaxAgeSeconds(idToken);
  if (maxAge <= 0 || maxAge > AUTH_COOKIE_MAX_AGE_SECONDS) return false;

  const jar = await cookies();
  jar.set(FIREBASE_AUTH_COOKIE, idToken, sessionCookieOptions(maxAge));
  return true;
}

/** Clears the HttpOnly session cookie. Legacy non-HttpOnly cookies are cleared too. */
export async function clearAuthSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(FIREBASE_AUTH_COOKIE, "", sessionCookieOptions(0));
  jar.set(LEGACY_FIREBASE_AUTH_COOKIE, "", sessionCookieOptions(0));
}
