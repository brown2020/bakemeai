/**
 * Server-side authentication for server actions and Node handlers.
 * Verifies Firebase ID tokens from the auth cookie when possible.
 */

import { cookies } from "next/headers";

import { FIREBASE_AUTH_COOKIE } from "@/lib/constants/auth";
import { AppError, ERROR_MESSAGES } from "@/lib/utils/error-handler";
import { logWarning } from "@/lib/utils/logger";
import {
  getUserIdFromJwtPayload,
  hasUnexpiredJwtClaimUnsigned,
  isUnexpiredJwtWithUserId,
  parseJwtPayload,
} from "@/lib/utils/jwt";

interface FirebaseLookupResponse {
  users?: Array<{ localId?: string }>;
}

/**
 * Verifies a Firebase ID token via Identity Toolkit REST API.
 * Falls back to unsigned expiry validation only in development when API key is missing.
 */
export async function verifyFirebaseIdToken(
  idToken: string
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development" && isUnexpiredJwtWithUserId(idToken)) {
      logWarning(
        "Firebase API key missing — using unsigned JWT expiry check for server auth",
        {}
      );
      return getUserIdFromJwtPayload(parseJwtPayload(idToken));
    }
    return null;
  }

  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = (await response.json()) as FirebaseLookupResponse;
    return data.users?.[0]?.localId ?? null;
  } catch {
    return null;
  }
}

/**
 * Reads the auth cookie and returns a verified Firebase user id.
 * @throws AppError when the user is not authenticated
 */
export async function requireAuthenticatedUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(FIREBASE_AUTH_COOKIE)?.value;

  if (!token) {
    throw new AppError(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED, "UNAUTHORIZED");
  }

  // Fast reject for obviously invalid/expired tokens before network call
  if (!hasUnexpiredJwtClaimUnsigned(token)) {
    throw new AppError(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED, "UNAUTHORIZED");
  }

  const uid = await verifyFirebaseIdToken(token);
  if (!uid) {
    throw new AppError(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED, "UNAUTHORIZED");
  }

  return uid;
}
