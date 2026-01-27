import { z } from "zod";
import { firestoreTimestampSchema } from "../utils/firestore";

/**
 * User profile schemas for validation and type safety.
 */

export const userProfileSchema = z.object({
  id: z.string(),
  dietary: z.array(z.string()),
  allergies: z.array(z.string()),
  dislikedIngredients: z.array(z.string()),
  cookingExperience: z.enum(["beginner", "intermediate", "advanced"]),
  servingSize: z.number().int().min(1).max(12),
  preferredCuisines: z.array(z.string()),
  updatedAt: firestoreTimestampSchema,
});

/**
 * User profile schema without Firestore Timestamp.
 * Used for client-side state and server action parameters.
 */
export const serializableUserProfileSchema = userProfileSchema.omit({
  updatedAt: true,
});

/**
 * Input schema for profile updates (without server-generated fields).
 */
export const userProfileInputSchema = userProfileSchema.omit({
  id: true,
  updatedAt: true,
});

// Type exports
export type UserProfile = z.infer<typeof userProfileSchema>;
export type SerializableUserProfile = z.infer<typeof serializableUserProfileSchema>;
export type UserProfileInput = z.infer<typeof userProfileInputSchema>;
