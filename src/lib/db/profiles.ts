/**
 * Firestore database operations for user profiles.
 * 
 * NAMING CONVENTIONS:
 * - get*: Synchronous or async read operations (getUserProfile)
 * - save*: Create or update operations (saveUserProfile)
 * 
 * ERROR HANDLING CONTRACT:
 * - All functions throw errors on failure (never return error objects)
 * - Callers MUST use try-catch blocks
 * - Errors are logged internally before being thrown
 * - User-friendly messages are included in thrown Error objects
 */

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import type {
  UserProfile,
  UserProfileInput,
} from "../schemas/user";
import { userProfileSchema } from "../schemas/user";
import { COLLECTIONS } from "../constants/domain";
import { AppError, ERROR_MESSAGES } from "../utils/error-handler";
import { sanitizeUserInput } from "../utils/sanitize";
import { logError } from "../utils/logger";

/**
 * Saves or updates a user profile in Firestore.
 * @param userId - The user's unique identifier
 * @param profile - The profile data to save
 */
export async function saveUserProfile(
  userId: string,
  profile: UserProfileInput
): Promise<void> {
  try {
    // Sanitize user-input arrays to prevent HTML injection in stored data
    const sanitizedProfile = {
      ...profile,
      allergies: profile.allergies.map(sanitizeUserInput),
      dislikedIngredients: profile.dislikedIngredients.map(sanitizeUserInput),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.USER_PROFILES, userId), sanitizedProfile);
  } catch (error) {
    logError("Failed to save user profile to Firestore", error, { userId });
    throw new AppError(ERROR_MESSAGES.PROFILE.SAVE_FAILED, "PROFILE_SAVE_FAILED", { userId });
  }
}

/**
 * Retrieves a user profile from Firestore.
 * @param userId - The user's unique identifier
 * @returns The user profile or null if not found
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const rawProfile = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      // Validate data with Zod schema
      const result = userProfileSchema.safeParse(rawProfile);
      if (!result.success) {
        throw new AppError("Invalid profile data from Firestore", "INVALID_PROFILE_DATA");
      }
      return result.data;
    }
    return null;
  } catch (error) {
    logError("Failed to fetch user profile from Firestore", error, { userId });
    throw new AppError(ERROR_MESSAGES.PROFILE.LOAD_FAILED, "PROFILE_LOAD_FAILED", { userId });
  }
}
