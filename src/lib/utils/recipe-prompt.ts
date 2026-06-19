import { z } from "zod";

import { FORM_VALIDATION } from "@/lib/constants/ui";
import type { RecipeMode } from "@/lib/schemas/recipe";
import {
  ingredientsRecipeInputSchema,
  specificRecipeInputSchema,
} from "@/lib/schemas/recipe";

const RECIPE_PROMPTS = {
  specific: (input: string) =>
    `Please provide a detailed recipe for: ${input}. Make it easy to follow for home cooks.`,
  ingredients: (ingredients: string) =>
    `I have these ingredients: ${ingredients}. Please suggest a recipe I can make with some or all of these ingredients. Prioritize using as many of the listed ingredients as possible while suggesting common pantry items to complete the recipe if needed.`,
};

/**
 * Optional tweak text appended when regenerating a recipe.
 * Empty tweak is allowed; non-empty values are length-capped.
 */
export const recipeTweakSchema = z
  .string()
  .trim()
  .max(
    FORM_VALIDATION.INPUT_MAX_LENGTH,
    `Tweak is too long (max ${FORM_VALIDATION.INPUT_MAX_LENGTH} characters)`
  );

/**
 * Validates optional regenerate tweak text.
 * @returns Error message or null when valid (including empty tweak)
 */
export function validateTweak(tweak: string): string | null {
  if (!tweak.trim()) return null;
  const result = recipeTweakSchema.safeParse(tweak);
  return result.success ? null : result.error.issues[0].message;
}

/**
 * Appends optional tweak instructions to a base recipe prompt.
 * Empty tweak returns the base prompt unchanged.
 */
export function appendTweakToPrompt(basePrompt: string, tweak: string): string {
  const trimmed = tweak.trim();
  if (!trimmed) return basePrompt;
  return `${basePrompt}\n\nAdditional request: ${trimmed}`;
}

/**
 * Checks if enough time has passed since the last generation submission.
 */
export function canSubmitRecipeGeneration(
  lastSubmitTime: number,
  debounceMs: number,
  now: number = Date.now()
): boolean {
  return now - lastSubmitTime >= debounceMs;
}

/**
 * Selects the active recipe input text for the current generation mode.
 */
export function getRecipeInputForMode(
  input: string,
  ingredients: string,
  mode: RecipeMode
): string {
  return mode === "specific" ? input : ingredients;
}

/**
 * Validates recipe input based on generation mode.
 */
export function validateRecipeInput(
  input: string,
  mode: RecipeMode
): string | null {
  const schema =
    mode === "specific"
      ? specificRecipeInputSchema
      : ingredientsRecipeInputSchema;

  const validation = schema.safeParse(input);
  return validation.success ? null : validation.error.issues[0].message;
}

/**
 * Builds the user prompt for the selected generation mode.
 */
export function buildRecipePrompt(input: string, mode: RecipeMode): string {
  const promptFn =
    mode === "specific" ? RECIPE_PROMPTS.specific : RECIPE_PROMPTS.ingredients;
  return promptFn(input);
}
