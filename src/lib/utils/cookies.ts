/**
 * Cookie management utilities for authentication.
 * Provides server-side cookie operations for Next.js middleware/proxy.
 */

import { NextResponse } from "next/server";
import {
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
} from "@/lib/auth-constants";

/**
 * All authentication cookie names used by the application.
 * Includes both current and legacy names for proper cleanup.
 */
const AUTH_COOKIE_NAMES = [
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
] as const;

/**
 * Deletes all auth-related cookies from a Next.js response.
 * 
 * This function:
 * - Clears the current authentication cookie
 * - Clears legacy cookie names for backward compatibility
 * - Ensures clean logout state across all cookie versions
 * 
 * Used during:
 * - User logout
 * - Invalid/expired token detection
 * - Authentication error recovery
 * 
 * @param response - The NextResponse object to modify
 * @returns void (modifies response in-place)
 */
export function deleteAuthCookies(response: NextResponse): void {
  AUTH_COOKIE_NAMES.forEach((cookieName) => {
    response.cookies.delete(cookieName);
  });
}
