import { z } from "zod";

/**
 * Recipe schemas for validation and type safety.
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

/**
 * Recipe structure schema for streaming validation.
 * 
 * All fields are optional to support progressive updates during AI streaming.
 * As the AI generates the recipe, partial objects are streamed and validated
 * against this schema. Fields populate incrementally until the full recipe is complete.
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

/**
 * Recipe fields for AI generation with describe() annotations.
 * Used by OpenAI structured output to understand field purpose.
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

/**
 * Parsed recipe data structure for UI display.
 * Used as an intermediate format between AI generation and rendering.
 */
export interface ParsedRecipe {
  title: string;
  content: string;
  structuredData?: RecipeStructure;
}

// Type exports
export type Recipe = z.infer<typeof recipeSchema>;
export type RecipeStructure = z.infer<typeof recipeStructureSchema>;
export type CompleteRecipeStructure = z.infer<typeof completeRecipeStructureSchema>;
