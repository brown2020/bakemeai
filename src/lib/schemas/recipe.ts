import { z } from "zod";
import { requiredTimestampSchema } from "../utils/firestore";
import { FORM_VALIDATION } from "../constants/ui";

/**
 * Recipe schemas for validation and type safety.
 * 
 * Organization:
 * - DOMAIN TYPES: Core domain types (RecipeMode)
 * - INPUT VALIDATION: User input validation for recipe generation
 * - BASE SCHEMAS: Core recipe data structures
 * - DERIVED SCHEMAS: Variations for specific use cases (streaming, validation)
 * - TYPE EXPORTS: TypeScript types derived from schemas
 */

// ============================================================================
// DOMAIN TYPES
// ============================================================================

/**
 * Recipe generation mode type.
 * Single source of truth for mode values across the application.
 */
export type RecipeMode = "specific" | "ingredients";

// ============================================================================
// INPUT VALIDATION
// ============================================================================

/**
 * Validation schema for specific recipe requests.
 * Used when user describes what they want to make.
 */
export const specificRecipeInputSchema = z
  .string()
  .trim()
  .min(
    FORM_VALIDATION.INPUT_MIN_LENGTH,
    `Please describe what you'd like to make (at least ${FORM_VALIDATION.INPUT_MIN_LENGTH} characters)`
  )
  .max(
    FORM_VALIDATION.INPUT_MAX_LENGTH,
    `Description is too long (max ${FORM_VALIDATION.INPUT_MAX_LENGTH} characters)`
  );

/**
 * Validation schema for ingredient-based recipe requests.
 * Used when user lists ingredients they have available.
 */
export const ingredientsRecipeInputSchema = z
  .string()
  .trim()
  .min(
    FORM_VALIDATION.TEXTAREA_MIN_LENGTH,
    `Please list at least one ingredient (at least ${FORM_VALIDATION.TEXTAREA_MIN_LENGTH} characters)`
  )
  .max(
    FORM_VALIDATION.TEXTAREA_MAX_LENGTH,
    `Ingredients list is too long (max ${FORM_VALIDATION.TEXTAREA_MAX_LENGTH} characters)`
  );

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Base recipe schema - represents a saved recipe in Firestore.
 * Includes database fields (id, userId, createdAt) plus recipe content.
 * 
 * BACKWARDS COMPATIBILITY:
 * - All metadata fields are optional to support recipes created before structured data
 * - UI components should handle undefined gracefully
 * - Uses passthrough() to allow legacy fields that may exist in old recipes
 */
export const recipeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  createdAt: requiredTimestampSchema,
  ingredients: z.array(z.string()).optional(),
  preparationTime: z.string().optional(),
  cookingTime: z.string().optional(),
  servings: z.number().int().positive().optional(),
  cuisine: z.string().optional(),
  difficulty: z.string().optional(),
}).passthrough();

// ============================================================================
// DERIVED SCHEMAS
// ============================================================================

/**
 * Recipe structure schema for streaming validation.
 * 
 * STREAMING CONTRACT:
 * - All fields are optional during streaming to support progressive updates
 * - As the AI generates the recipe, partial objects are validated against this schema
 * - Required for final save: title, preparationTime, cookingTime, servings, difficulty, ingredients (min 1), instructions (min 1)
 * - Truly optional: tips, calories, macros
 * - Use completeRecipeStructureSchema to validate before saving
 */
export const recipeStructureSchema = z.object({
  title: z.string().optional(),
  preparationTime: z.string().optional(),
  cookingTime: z.string().optional(),
  servings: z.number().optional(),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).optional(),
  ingredients: z.array(z.string()).optional(),
  instructions: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  calories: z.number().nullable().optional(),
  macros: z.object({
    protein: z.string().nullable(),
    carbs: z.string().nullable(),
    fat: z.string().nullable(),
  }).nullable().optional(),
});

/**
 * Complete recipe schema for final validation before saving.
 * Ensures all essential fields are present for a valid recipe.
 * 
 * DESIGN DECISION: Separate schema instead of .required() transformation
 * - Clearly documents what constitutes a "complete" recipe vs "partial" (streaming)
 * - Used as type guard for runtime validation before save
 * - Makes streaming contract explicit: optional during generation, required for persistence
 */
export const completeRecipeStructureSchema = z.object({
  title: z.string(),
  preparationTime: z.string(),
  cookingTime: z.string(),
  servings: z.number(),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]),
  ingredients: z.array(z.string()).min(1, "Recipe must have at least one ingredient"),
  instructions: z.array(z.string()).min(1, "Recipe must have at least one instruction"),
  tips: z.array(z.string()).optional(),
  calories: z.number().nullable().optional(),
  macros: z.object({
    protein: z.string().nullable(),
    carbs: z.string().nullable(),
    fat: z.string().nullable(),
  }).nullable().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/**
 * Parsed recipe data structure for UI display.
 * Used as an intermediate format between AI generation and rendering.
 */
export interface ParsedRecipe {
  title: string;
  content: string;
  structuredData?: RecipeStructure;
}

export type Recipe = z.infer<typeof recipeSchema>;
export type RecipeStructure = z.infer<typeof recipeStructureSchema>;
export type CompleteRecipeStructure = z.infer<typeof completeRecipeStructureSchema>;
