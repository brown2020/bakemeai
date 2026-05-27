/**
 * JWT parsing and unsigned expiry validation for Firebase ID tokens.
 * Edge-safe — no Node-only APIs except optional Buffer fallback.
 *
 * SECURITY: Expiry-only validation. Signature verification happens in
 * server-auth.ts via Firebase Identity Toolkit REST API when possible.
 */

import { JWT_VALIDATION_CONFIG } from "@/lib/constants/auth";

/** Base64 encoding uses groups of 4 characters. */
const BASE64_PADDING_SIZE = 4;

const MILLISECONDS_PER_SECOND = 1000;

export interface FirebaseJwtPayload {
  exp?: number;
  sub?: string;
  user_id?: string;
}

/**
 * Decodes base64url JWT payload segment to UTF-8.
 */
export function base64UrlToUtf8(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const paddingNeeded =
    (BASE64_PADDING_SIZE - (base64.length % BASE64_PADDING_SIZE)) %
    BASE64_PADDING_SIZE;
  const padded = base64.padEnd(base64.length + paddingNeeded, "=");

  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  throw new Error("No base64 decoder available");
}

/**
 * Parses a JWT token and extracts its payload.
 * Does not validate signature or expiry.
 */
export function parseJwtPayload(token: string): FirebaseJwtPayload | null {
  const jwtParts = token.split(".");
  if (jwtParts.length !== 3) return null;

  try {
    return JSON.parse(base64UrlToUtf8(jwtParts[1])) as FirebaseJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns the Firebase user id from a parsed JWT payload.
 */
export function getUserIdFromJwtPayload(
  payload: FirebaseJwtPayload | null
): string | null {
  if (!payload) return null;
  return payload.user_id ?? payload.sub ?? null;
}

/**
 * Checks if a JWT token's expiry claim is still valid (unsigned).
 */
export function hasUnexpiredJwtClaimUnsigned(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;

  const nowSeconds = Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
  return payload.exp > nowSeconds - JWT_VALIDATION_CONFIG.EXPIRY_LEEWAY_SECONDS;
}

/**
 * Validates token structure and expiry without signature verification.
 */
export function isUnexpiredJwtWithUserId(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!hasUnexpiredJwtClaimUnsigned(token)) return false;
  return getUserIdFromJwtPayload(payload) != null;
}
