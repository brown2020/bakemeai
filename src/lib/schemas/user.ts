import { z } from "zod";
import { firestoreTimestampSchema } from "../utils/firestore";

/**
 * User profile schemas for validation and type safety.
 * 
 * Organization:
 * - BASE SCHEMAS: Core user profile data structure
 * - DERIVED SCHEMAS: Variations for specific use cases (serializable, input)
 * - TYPE EXPORTS: TypeScript types derived from schemas
 */

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Base user profile schema - represents a user profile in Firestore.
 * Includes database fields (id, updatedAt) plus user preferences.
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

// ============================================================================
// DERIVED SCHEMAS
// ============================================================================
//
// DESIGN DECISION: Named schemas vs inline transformations
// 
// We create named derived schemas (rather than inline .omit() at usage sites) when:
// 1. Schema is used 3+ times (reduces duplication)
// 2. Schema represents a meaningful domain concept (e.g., "serializable" vs "with timestamp")
// 3. Type is exported for reuse across files
//
// For one-off transformations, use inline: someSchema.omit({ field: true })
// ============================================================================

/**
 * User profile schema without Firestore Timestamp.
 * Used for client-side state and server action parameters.
 * 
 * USAGE: 5+ files (hooks, services, stores) - justifies named schema.
 */
export const serializableUserProfileSchema = userProfileSchema.omit({
  updatedAt: true,
});

/**
 * Input schema for profile updates (without server-generated fields).
 * Used for form submissions and API calls.
 * 
 * USAGE: 2+ files - justifies named schema.
 */
export const userProfileInputSchema = userProfileSchema.omit({
  id: true,
  updatedAt: true,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UserProfile = z.infer<typeof userProfileSchema>;
export type SerializableUserProfile = z.infer<typeof serializableUserProfileSchema>;
export type UserProfileInput = z.infer<typeof userProfileInputSchema>;
