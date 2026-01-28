import { z } from "zod";
import { requiredTimestampSchema } from "../utils/firestore";

/**
 * Recipe schemas for validation and type safety.
 * 
 * Organization:
 * - DOMAIN TYPES: Core domain types (RecipeMode)
 * - BASE SCHEMAS: Core recipe data structures
 * - DERIVED SCHEMAS: Variations for specific use cases (streaming, validation)
 * - AI SCHEMAS: Annotated schemas for AI generation
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

/**
 * Recipe mode with nullable option for UI state.
 */
export type RecipeModeNullable = RecipeMode | null;

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
});

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
// AI SCHEMAS
// ============================================================================

/**
 * Recipe fields for AI generation with describe() annotations.
 * Used by OpenAI structured output to understand field purpose.
 * 
 * DESIGN NOTE: `as const` usage
 * - This is an object of Zod schemas (not a Zod schema itself)
 * - Used in recipe-generation.server.ts: z.object(aiRecipeFields).strict()
 * - `as const` prevents TypeScript from widening field types
 * - Other schemas don't need `as const` because they're already Zod schemas
 * - This pattern allows field reuse while maintaining strict typing
 */
export const aiRecipeFields = {
  title: z.string().describe("The title of the recipe"),
  preparationTime: z.string().describe("Time needed for preparation (e.g. '15 mins')"),
  cookingTime: z.string().describe("Time needed for cooking (e.g. '45 mins')"),
  servings: z.number().describe("Number of people served"),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).describe("Difficulty level"),
  ingredients: z.array(z.string()).describe("List of ingredients with measurements"),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
  tips: z.array(z.string()).describe("Helpful cooking tips"),
  calories: z.number().nullable().describe("Approximate calories per serving (use null if unknown)"),
  macros: z.object({
    protein: z.string().nullable().describe("Protein per serving (use null if unknown)"),
    carbs: z.string().nullable().describe("Carbs per serving (use null if unknown)"),
    fat: z.string().nullable().describe("Fat per serving (use null if unknown)"),
  }).strict().nullable().describe("Macronutrients per serving (use null if unknown)"),
} as const;

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
