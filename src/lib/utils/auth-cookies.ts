/**
 * Authentication cookie management utilities.
 * Provides both client-side and server-side cookie operations.
 */

import Cookies from "js-cookie";
import { NextResponse } from "next/server";
import {
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
  COOKIE_CONFIG,
} from "@/lib/constants/auth";

/**
 * All authentication cookie names used by the application.
 * Includes both current and legacy names for proper cleanup.
 */
const AUTH_COOKIE_NAMES = [
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
] as const;

// ============================================================================
// CLIENT-SIDE COOKIE OPERATIONS (browser context, uses js-cookie)
// ============================================================================

/**
 * Cookie configuration for Firebase authentication tokens.
 * 
 * Security settings:
 * - SameSite=Strict: Prevents CSRF attacks
 * - Secure: HTTPS only in production
 * - Path=/: Available across entire app
 * - 7-day expiry: Balances security and UX
 */
const cookieOptions = {
  expires: COOKIE_CONFIG.EXPIRY_DAYS,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
} as const;

/**
 * Sets the Firebase authentication token in a client-side cookie.
 * Used after successful login/signup to persist authentication state.
 * 
 * @param token - The Firebase ID token (JWT) from successful authentication
 */
export function setAuthCookieToken(token: string): void {
  Cookies.set(FIREBASE_AUTH_COOKIE, token, cookieOptions);
}

/**
 * Clears all authentication cookies from the client.
 * Removes both current and legacy cookie names to ensure clean logout.
 * 
 * Used during:
 * - User logout
 * - Session expiration
 * - Authentication errors
 */
export function clearAuthCookie(): void {
  AUTH_COOKIE_NAMES.forEach((name) => {
    Cookies.remove(name, { path: "/" });
  });
}

// ============================================================================
// SERVER-SIDE COOKIE OPERATIONS (Next.js middleware/proxy context)
// ============================================================================

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
 */
export function deleteAuthCookies(response: NextResponse): void {
  AUTH_COOKIE_NAMES.forEach((cookieName) => {
    response.cookies.delete(cookieName);
  });
}
