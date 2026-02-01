/**
 * Authentication schemas and types.
 * Provides serializable user type for store/API boundaries.
 */

import { z } from "zod";
import type { User } from "firebase/auth";

/**
 * Serializable user schema containing only essential auth fields.
 *
 * Why this exists:
 * - Firebase User object contains non-serializable properties (methods, Timestamps)
 * - This can cause issues with SSR/hydration and Zustand persistence
 * - We only need a subset of user data for UI rendering
 *
 * Fields included:
 * - uid: Unique identifier for database operations
 * - email: For display and contact
 * - displayName: For personalized UI
 * - photoURL: For avatar display
 * - emailVerified: For conditional UI (verification prompts)
 */
export const serializableAuthUserSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable().or(z.literal("")),
  emailVerified: z.boolean(),
});

export type SerializableAuthUser = z.infer<typeof serializableAuthUserSchema>;

/**
 * Extracts serializable fields from Firebase User.
 * Use this when storing user in Zustand or passing to components.
 *
 * @param firebaseUser - The Firebase User object from auth state
 * @returns SerializableAuthUser with only essential fields
 *
 * @example
 * onIdTokenChanged(auth, (user) => {
 *   if (user) {
 *     setUser(toSerializableAuthUser(user));
 *   }
 * });
 */
export function toSerializableAuthUser(firebaseUser: User): SerializableAuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
}
