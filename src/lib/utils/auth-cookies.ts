/**
 * Authentication cookie management utilities.
 * The live session cookie is HttpOnly and is set from a server action.
 * This module only clears legacy client-readable cookies.
 */

import Cookies from "js-cookie";
import { NextResponse } from "next/server";
import {
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
} from "@/lib/constants/auth";

/**
 * All authentication cookie names used by the application.
 * Includes both current and legacy names for proper cleanup.
 */
const AUTH_COOKIE_NAMES = [
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
] as const;

/**
 * Clears legacy non-HttpOnly authentication cookies from the browser.
 * The HttpOnly session cookie is cleared by `clearAuthSessionCookie`.
 */
export function clearAuthCookie(): void {
  AUTH_COOKIE_NAMES.forEach((name) => {
    Cookies.remove(name, { path: "/" });
  });
}

/**
 * Deletes auth cookies on a proxy response.
 * Matches the HttpOnly session cookie attributes so the browser drops it.
 */
export function deleteAuthCookies(response: NextResponse): void {
  const clearOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 0,
  };

  AUTH_COOKIE_NAMES.forEach((cookieName) => {
    response.cookies.set(cookieName, "", clearOptions);
  });
}
