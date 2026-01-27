"use client";

import Cookies from "js-cookie";
import {
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
} from "@/lib/auth-constants";
import { AUTH_COOKIE_CONFIG } from "@/lib/constants";

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
  expires: AUTH_COOKIE_CONFIG.EXPIRY_DAYS,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
} as const;

/**
 * All authentication cookie names for cleanup operations.
 */
const AUTH_COOKIE_NAMES = [
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
] as const;

/**
 * Sets the Firebase authentication token in a client-side cookie.
 * Used after successful login/signup to persist authentication state.
 * 
 * @param token - The Firebase ID token (JWT) from successful authentication
 * @returns void
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
 * 
 * @returns void
 */
export function clearAuthCookie(): void {
  AUTH_COOKIE_NAMES.forEach((name) => {
    Cookies.remove(name, { path: "/" });
  });
}
