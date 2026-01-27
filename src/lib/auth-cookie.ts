"use client";

import Cookies from "js-cookie";
import {
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
} from "@/lib/auth-constants";
import { AUTH_COOKIE_CONFIG } from "@/lib/constants";

// Cookie configuration for Firebase auth
const cookieOptions = {
  expires: AUTH_COOKIE_CONFIG.EXPIRY_DAYS,
  path: "/",
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

export function setAuthCookieToken(token: string) {
  Cookies.set(FIREBASE_AUTH_COOKIE, token, cookieOptions);
}

export function clearAuthCookie() {
  // Clear both current and legacy cookie names
  for (const name of [FIREBASE_AUTH_COOKIE, LEGACY_FIREBASE_AUTH_COOKIE]) {
    Cookies.remove(name, { path: "/" });
  }
}
