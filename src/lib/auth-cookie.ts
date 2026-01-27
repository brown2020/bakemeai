"use client";

import { User } from "firebase/auth";
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
  // Try several variants to ensure the cookie is cleared across common host/path setups.
  for (const name of [FIREBASE_AUTH_COOKIE, LEGACY_FIREBASE_AUTH_COOKIE]) {
    Cookies.remove(name);
    Cookies.remove(name, { path: "/" });

    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      Cookies.remove(name, { path: "/", domain: hostname });
      Cookies.remove(name, { path: "/", domain: `.${hostname}` });
    }
  }
}

// Set the auth cookie with the user's ID token (kept for backwards compatibility)
export const setAuthCookie = async (user: User | null) => {
  if (!user) {
    clearAuthCookie();
    return;
  }

  const token = await user.getIdToken();
  setAuthCookieToken(token);
};

// Remove the auth cookie (for logout)
export const removeAuthCookie = () => {
  clearAuthCookie();
};
