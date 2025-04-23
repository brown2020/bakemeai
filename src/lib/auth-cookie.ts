"use client";

import { User } from "firebase/auth";
import Cookies from "js-cookie";

// Cookie name for Firebase auth
export const FIREBASE_AUTH_COOKIE = "firebaseAuth";

// Set the auth cookie with the user's ID token
export const setAuthCookie = async (user: User | null) => {
  if (user) {
    // Get the user's ID token
    const token = await user.getIdToken();
    // Set the cookie with the token
    Cookies.set(FIREBASE_AUTH_COOKIE, token, {
      expires: 7, // 7 days
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    // Remove the cookie if user is null (logged out)
    Cookies.remove(FIREBASE_AUTH_COOKIE);
  }
};

// Remove the auth cookie (for logout)
export const removeAuthCookie = () => {
  Cookies.remove(FIREBASE_AUTH_COOKIE);
};
