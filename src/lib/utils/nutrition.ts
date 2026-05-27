/**
 * Nutrition summary utilities for recipe display.
 */

export interface NutritionSummary {
  calories: number | null;
  protein: string | null;
  carbs: string | null;
  fat: string | null;
}

interface NutritionSource {
  calories?: number | null;
  macros?: {
    protein?: string | null;
    carbs?: string | null;
    fat?: string | null;
  } | null;
}

function hasValue(value: string | number | null | undefined): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return Number.isFinite(value);
}

/**
 * Builds a nutrition summary from structured recipe fields.
 * Returns null when no nutrition data is available.
 */
export function extractNutritionSummary(
  source: NutritionSource | null | undefined
): NutritionSummary | null {
  if (!source) return null;

  const summary: NutritionSummary = {
    calories: source.calories ?? null,
    protein: source.macros?.protein ?? null,
    carbs: source.macros?.carbs ?? null,
    fat: source.macros?.fat ?? null,
  };

  return hasNutritionSummary(summary) ? summary : null;
}

/**
 * Returns true when at least one nutrition field has a displayable value.
 */
export function hasNutritionSummary(summary: NutritionSummary): boolean {
  return (
    hasValue(summary.calories) ||
    hasValue(summary.protein) ||
    hasValue(summary.carbs) ||
    hasValue(summary.fat)
  );
}
