import { User } from "firebase/auth";
import { setAuthCookieToken } from "@/lib/auth-cookie";

/**
 * Authentication utility functions.
 * Centralizes common auth operations to eliminate duplication.
 */

/**
 * Extracts and sets the auth cookie from a Firebase user.
 * Centralizes the token extraction logic used across login, signup, and Google auth.
 * 
 * @param user - The Firebase user object
 * @returns Promise that resolves when the token is set
 */
export async function setUserAuthToken(user: User): Promise<void> {
  const token = await user.getIdToken();
  setAuthCookieToken(token);
}
