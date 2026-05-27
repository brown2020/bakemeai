import { z } from "zod";

import { FORM_VALIDATION } from "@/lib/constants/ui";

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
