/**
 * Cookie management utilities for authentication.
 */

import { NextResponse } from "next/server";
import {
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
} from "@/lib/auth-constants";

/**
 * Deletes all auth-related cookies from a Next.js response.
 * Clears both current and legacy cookie names.
 * @param response - The NextResponse object to modify
 */
export function deleteAuthCookies(response: NextResponse): void {
  response.cookies.delete(FIREBASE_AUTH_COOKIE);
  response.cookies.delete(LEGACY_FIREBASE_AUTH_COOKIE);
}
