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
  content?: string | null;
  calories?: number | null;
  macros?: {
    protein?: string | null;
    carbs?: string | null;
    fat?: string | null;
  } | null;
}

type NutritionKey = "protein" | "carbs" | "fat";

function hasValue(value: string | number | null | undefined): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return Number.isFinite(value);
}

function coalesceText(
  primary: string | null | undefined,
  fallback: string | null | undefined
): string | null {
  return primary?.trim() ? primary : fallback?.trim() ? fallback : null;
}

function normalizeNutritionLine(line: string): string {
  return line
    .trim()
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .trim();
}

function normalizeMacroValue(value: string): string | null {
  const normalized = value.replace(/[`*_]/g, "").trim();
  if (!normalized || /^(?:n\/a|none|unknown|null)$/i.test(normalized)) {
    return null;
  }
  return normalized;
}

function parseCalories(value: string): number | null {
  const match = value.match(
    /(?:about|approx\.?|approximately|~)?\s*([0-9][0-9,]*(?:\.\d+)?)/
  );
  if (!match) return null;

  const parsed = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMacroLine(line: string): [NutritionKey, string] | null {
  const match = line.match(
    /^(protein|carbs?|carbohydrates?|total fat|fat)(?:\s+per serving)?\s*:\s*(.+)$/i
  );
  if (!match) return null;

  const label = match[1].toLowerCase();
  const value = normalizeMacroValue(match[2]);
  if (!value) return null;

  if (label.startsWith("protein")) return ["protein", value];
  if (label.startsWith("carb")) return ["carbs", value];
  return ["fat", value];
}

/**
 * Extracts nutrition fields from legacy markdown content when saved recipes do
 * not have top-level nutrition fields.
 */
export function extractNutritionFromMarkdown(
  content: string | null | undefined
): NutritionSummary | null {
  if (!content) return null;

  const summary: NutritionSummary = {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  };

  for (const rawLine of content.split(/\r?\n/)) {
    const line = normalizeNutritionLine(rawLine);

    const caloriesMatch = line.match(
      /^(?:estimated\s+)?(?:calories|calories per serving|approx(?:imate)? calories)(?:\s*\([^)]*\))?\s*:\s*(.+)$/i
    );
    if (caloriesMatch && summary.calories == null) {
      summary.calories = parseCalories(caloriesMatch[1]);
      continue;
    }

    const macro = parseMacroLine(line);
    if (macro) {
      const [key, value] = macro;
      summary[key] ??= value;
    }
  }

  return hasNutritionSummary(summary) ? summary : null;
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
  const markdownSummary = extractNutritionFromMarkdown(source.content);

  const summaryWithFallback: NutritionSummary = {
    calories: summary.calories ?? markdownSummary?.calories ?? null,
    protein: coalesceText(summary.protein, markdownSummary?.protein),
    carbs: coalesceText(summary.carbs, markdownSummary?.carbs),
    fat: coalesceText(summary.fat, markdownSummary?.fat),
  };

  return hasNutritionSummary(summaryWithFallback) ? summaryWithFallback : null;
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
