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

export interface VerifiedFirebaseUser {
  uid: string;
  emailVerified: boolean;
}

interface FirebaseLookupUser {
  localId?: unknown;
  emailVerified?: unknown;
}

interface FirebaseLookupResponse {
  users?: FirebaseLookupUser[];
}

/**
 * Reads the Identity Toolkit lookup payload. emailVerified must be exactly
 * true; a missing flag is treated as unverified.
 */
export function readLookupUser(data: unknown): VerifiedFirebaseUser | null {
  if (!data || typeof data !== "object" || !("users" in data)) return null;
  const users = (data as FirebaseLookupResponse).users;
  const user = users?.[0];
  if (!user || typeof user.localId !== "string" || user.localId.length === 0) {
    return null;
  }

  return {
    uid: user.localId,
    emailVerified: user.emailVerified === true,
  };
}

/**
 * Verifies a Firebase ID token via Identity Toolkit REST API.
 * Falls back to unsigned expiry validation only in development when the API key is missing.
 */
export async function verifyFirebaseIdToken(
  idToken: string
): Promise<VerifiedFirebaseUser | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development" && isUnexpiredJwtWithUserId(idToken)) {
      logWarning(
        "Firebase API key missing — using unsigned JWT expiry check for server auth",
        {}
      );
      const payload = parseJwtPayload(idToken);
      const uid = getUserIdFromJwtPayload(payload);
      if (!uid) return null;
      return {
        uid,
        emailVerified: payload?.email_verified === true,
      };
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
      redirect: "error",
    });

    if (!response.ok) return null;

    return readLookupUser(await response.json());
  } catch {
    return null;
  }
}

interface SessionUser extends VerifiedFirebaseUser {
  idToken: string;
}

async function readSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(FIREBASE_AUTH_COOKIE)?.value;

  if (!token || !hasUnexpiredJwtClaimUnsigned(token)) return null;

  const verified = await verifyFirebaseIdToken(token);
  if (!verified) return null;

  return { ...verified, idToken: token };
}

/**
 * Reads the auth cookie and returns a verified Firebase user id.
 * @throws AppError when the user is not authenticated
 */
export async function requireAuthenticatedUserId(): Promise<string> {
  const user = await readSessionUser();
  if (!user) {
    throw new AppError(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED, "UNAUTHORIZED");
  }

  return user.uid;
}

/**
 * Auth gate for recipe generation. Unverified email/password accounts are rejected
 * so they cannot spend the OpenAI quota. Google accounts are already verified.
 */
export async function requireGenerationUser(): Promise<SessionUser> {
  const user = await readSessionUser();
  if (!user) {
    throw new AppError(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED, "UNAUTHORIZED");
  }

  if (!user.emailVerified) {
    throw new AppError(
      ERROR_MESSAGES.AUTH.EMAIL_NOT_VERIFIED,
      "EMAIL_NOT_VERIFIED"
    );
  }

  return user;
}
