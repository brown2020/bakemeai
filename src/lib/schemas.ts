import { z } from "zod";
import { firestoreTimestampSchema } from "./utils/firestore";

/**
 * Zod schemas for runtime validation of Firestore data.
 * Ensures type safety and data integrity across the application.
 * 
 * SCHEMA ORGANIZATION:
 * - Single-use schemas: Defined inline (recipeSchema, userProfileSchema)
 * - Multi-use schemas: Extract base fields, compose variations (recipe structure schemas)
 * - This balances DRY principles with code clarity
 * 
 * TYPE EXPORTS:
 * - All TypeScript types are co-located with their schemas using z.infer<typeof schema>
 * - This ensures schema and type definitions stay synchronized
 * - Import types from this module rather than creating inline z.infer usages elsewhere
 */

export const recipeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  createdAt: z.number(),
  ingredients: z.array(z.string()),
  preparationTime: z.string(),
  cookingTime: z.string(),
  servings: z.number().int().positive(),
  cuisine: z.string().optional(),
  difficulty: z.string().optional(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  dietary: z.array(z.string()),
  allergies: z.array(z.string()),
  dislikedIngredients: z.array(z.string()),
  cookingExperience: z.enum(["beginner", "intermediate", "advanced"]),
  servingSize: z.number().int().min(1).max(12),
  preferredCuisines: z.array(z.string()),
  updatedAt: firestoreTimestampSchema,
  updatedAtString: z.string().optional(),
});

/**
 * User profile schema without Firestore Timestamp.
 * Used for client-side state and server action parameters.
 */
export const serializableUserProfileSchema = userProfileSchema.omit({
  updatedAt: true,
});

/**
 * Base recipe structure fields (core definitions without modifiers).
 * Single source of truth for recipe field structure.
 */
const baseRecipeFields = {
  title: z.string(),
  preparationTime: z.string(),
  cookingTime: z.string(),
  servings: z.number(),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  tips: z.array(z.string()),
  calories: z.number().nullable(),
  macros: z.object({
    protein: z.string().nullable(),
    carbs: z.string().nullable(),
    fat: z.string().nullable(),
  }).nullable(),
} as const;

/**
 * Recipe structure schema for streaming validation.
 * 
 * All fields are optional to support progressive updates during AI streaming.
 * As the AI generates the recipe, partial objects are streamed and validated
 * against this schema. Fields populate incrementally until the full recipe is complete.
 */
export const recipeStructureSchema = z.object({
  title: baseRecipeFields.title.optional(),
  preparationTime: baseRecipeFields.preparationTime.optional(),
  cookingTime: baseRecipeFields.cookingTime.optional(),
  servings: baseRecipeFields.servings.optional(),
  difficulty: baseRecipeFields.difficulty.optional(),
  ingredients: baseRecipeFields.ingredients.optional(),
  instructions: baseRecipeFields.instructions.optional(),
  tips: baseRecipeFields.tips.optional(),
  calories: baseRecipeFields.calories.optional(),
  macros: baseRecipeFields.macros.optional(),
});

/**
 * Complete recipe schema for final validation before saving.
 * Ensures all essential fields are present for a valid recipe.
 */
export const completeRecipeStructureSchema = z.object({
  title: baseRecipeFields.title,
  preparationTime: baseRecipeFields.preparationTime,
  cookingTime: baseRecipeFields.cookingTime,
  servings: baseRecipeFields.servings,
  difficulty: baseRecipeFields.difficulty,
  ingredients: baseRecipeFields.ingredients.min(1, "Recipe must have at least one ingredient"),
  instructions: baseRecipeFields.instructions.min(1, "Recipe must have at least one instruction"),
  tips: baseRecipeFields.tips.optional(),
  calories: baseRecipeFields.calories.optional(),
  macros: baseRecipeFields.macros.optional(),
});

/**
 * Base recipe fields for AI generation (exported for use in server actions).
 * Includes .describe() annotations for AI context.
 */
export const aiRecipeFields = {
  title: baseRecipeFields.title.describe("The title of the recipe"),
  preparationTime: baseRecipeFields.preparationTime.describe("Time needed for preparation (e.g. '15 mins')"),
  cookingTime: baseRecipeFields.cookingTime.describe("Time needed for cooking (e.g. '45 mins')"),
  servings: baseRecipeFields.servings.describe("Number of people served"),
  difficulty: baseRecipeFields.difficulty.describe("Difficulty level"),
  ingredients: baseRecipeFields.ingredients.describe("List of ingredients with measurements"),
  instructions: baseRecipeFields.instructions.describe("Step-by-step cooking instructions"),
  tips: baseRecipeFields.tips.describe("Helpful cooking tips"),
  calories: baseRecipeFields.calories.describe("Approximate calories per serving (use null if unknown)"),
  macros: z.object({
    protein: z.string().nullable().describe("Protein per serving (use null if unknown)"),
    carbs: z.string().nullable().describe("Carbs per serving (use null if unknown)"),
    fat: z.string().nullable().describe("Fat per serving (use null if unknown)"),
  }).strict().nullable().describe("Macronutrients per serving (use null if unknown)"),
} as const;

// Input schema for profile updates (without server-generated fields)
export const userProfileInputSchema = userProfileSchema.omit({
  id: true,
  updatedAt: true,
  updatedAtString: true,
});

// Form validation schemas
export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

// Individual validation schemas for each input mode
export const specificRecipeInputSchema = z
  .string()
  .trim()
  .min(3, "Please describe what you'd like to make (at least 3 characters)")
  .max(500, "Description is too long (max 500 characters)");

export const ingredientsRecipeInputSchema = z
  .string()
  .trim()
  .min(3, "Please list at least one ingredient (at least 3 characters)")
  .max(1000, "Ingredients list is too long (max 1000 characters)");

// Type exports for use across the app
export type Recipe = z.infer<typeof recipeSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type SerializableUserProfile = z.infer<typeof serializableUserProfileSchema>;
export type UserProfileInput = z.infer<typeof userProfileInputSchema>;
export type RecipeStructure = z.infer<typeof recipeStructureSchema>;
export type CompleteRecipeStructure = z.infer<typeof completeRecipeStructureSchema>;

/**
 * Parsed recipe data structure for UI display.
 * Used as an intermediate format between AI generation and rendering.
 * 
 * @property title - Recipe title (displayed separately from content)
 * @property content - Markdown content without the title (for body rendering)
 * @property structuredData - Original structured data from AI (for saving to DB)
 */
export interface ParsedRecipe {
  title: string;
  content: string;
  structuredData?: RecipeStructure;
}
