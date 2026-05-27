import type { RecipeStructure } from "@/lib/schemas/recipe";
import { NUMBER_INPUT } from "@/lib/constants/ui";

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "⅓": 1 / 3,
  "¼": 0.25,
  "¾": 0.75,
  "⅛": 0.125,
  "⅔": 2 / 3,
  "⅜": 0.375,
};

interface ParsedQuantity {
  value: number;
  rest: string;
}

/**
 * Parses a leading quantity from an ingredient or instruction fragment.
 */
export function parseLeadingQuantity(text: string): ParsedQuantity | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const unicodeMatch = trimmed.match(/^([½⅓¼¾⅛⅔⅜])\s+(.*)$/u);
  if (unicodeMatch) {
    return {
      value: UNICODE_FRACTIONS[unicodeMatch[1]],
      rest: unicodeMatch[2],
    };
  }

  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)\s+(.*)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);
    if (denominator === 0) return null;
    return { value: whole + numerator / denominator, rest: mixedMatch[4] };
  }

  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)\s+(.*)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator === 0) return null;
    return { value: numerator / denominator, rest: fractionMatch[3] };
  }

  const decimalMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.*)$/);
  if (decimalMatch) {
    return { value: Number(decimalMatch[1]), rest: decimalMatch[2] };
  }

  return null;
}

/**
 * Formats a scaled numeric quantity for display in ingredient lines.
 */
export function formatScaledQuantity(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return String(value);
  }

  const rounded = Math.round(value * 100) / 100;
  const whole = Math.floor(rounded);
  const fractional = rounded - whole;

  const fractionLabels: Array<[number, string]> = [
    [0.25, "1/4"],
    [0.333, "1/3"],
    [0.375, "3/8"],
    [0.5, "1/2"],
    [0.666, "2/3"],
    [0.75, "3/4"],
  ];

  for (const [target, label] of fractionLabels) {
    if (Math.abs(fractional - target) < 0.02) {
      return whole > 0 ? `${whole} ${label}` : label;
    }
  }

  if (Math.abs(fractional) < 0.02) {
    return String(whole);
  }

  return String(rounded);
}

const MEASUREMENT_UNITS =
  "cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|g|grams?|kg|ml|milliliters?|l|liters?|cloves?|pounds?|lbs?|lb|pinches?|slices?|cans?|sticks?";

const EMBEDDED_QUANTITY_PATTERN = new RegExp(
  `(\\d+\\s+\\d+/\\d+|\\d+/\\d+|\\d+(?:\\.\\d+)?|[½⅓¼¾⅛⅔⅜])\\s+(${MEASUREMENT_UNITS})\\b`,
  "gi"
);

function parseQuantityToken(token: string): number | null {
  const parsed = parseLeadingQuantity(`${token.trim()} x`);
  return parsed?.value ?? null;
}

/**
 * Scales all recognizable quantity + unit pairs within a line of text.
 */
export function scaleAllQuantitiesInText(text: string, factor: number): string {
  return text.replace(
    EMBEDDED_QUANTITY_PATTERN,
    (match, quantityPart: string, unit: string) => {
      const value = parseQuantityToken(quantityPart);
      if (value == null || value <= 0) return match;
      const scaled = formatScaledQuantity(value * factor);
      return `${scaled} ${unit}`;
    }
  );
}

/**
 * Scales a leading quantity in an ingredient line.
 */
export function scaleQuantityInText(text: string, factor: number): string {
  const parsed = parseLeadingQuantity(text);
  if (!parsed) return text;

  const scaled = parsed.value * factor;
  if (scaled <= 0 || !Number.isFinite(scaled)) return text;

  return `${formatScaledQuantity(scaled)} ${parsed.rest}`;
}

function buildServingScaleNote(
  originalServings: number,
  targetServings: number
): string {
  return `Note: Ingredient quantities have been adjusted to serve ${targetServings} (originally ${originalServings}). Review amounts before cooking.`;
}

/**
 * Returns a new recipe scaled to the target number of servings.
 * Scales ingredients, optional calories, and prepends an instruction note.
 */
export function scaleRecipeServings(
  recipe: RecipeStructure,
  targetServings: number
): RecipeStructure {
  const currentServings = recipe.servings;
  if (
    currentServings == null ||
    currentServings <= 0 ||
    targetServings <= 0 ||
    targetServings === currentServings
  ) {
    return recipe;
  }

  const clampedTarget = Math.min(
    Math.max(targetServings, NUMBER_INPUT.SERVING_SIZE_MIN),
    NUMBER_INPUT.SERVING_SIZE_MAX
  );

  if (clampedTarget === currentServings) {
    return recipe;
  }

  const factor = clampedTarget / currentServings;

  const scaledIngredients = (recipe.ingredients ?? []).map((ingredient) =>
    scaleQuantityInText(ingredient, factor)
  );

  const scaledInstructions = (recipe.instructions ?? []).map((step) =>
    scaleAllQuantitiesInText(step, factor)
  );

  const scaleNote = buildServingScaleNote(currentServings, clampedTarget);
  const instructionsWithNote =
    scaledInstructions.length > 0
      ? [
          scaleNote,
          ...scaledInstructions.filter((step) => step !== scaleNote),
        ]
      : [scaleNote];

  return {
    ...recipe,
    servings: clampedTarget,
    ingredients: scaledIngredients,
    instructions: instructionsWithNote,
    calories:
      recipe.calories != null
        ? Math.max(1, Math.round(recipe.calories * factor))
        : recipe.calories,
  };
}

/**
 * Returns true when the recipe has enough data to scale servings.
 */
export function canScaleRecipeServings(recipe: RecipeStructure): boolean {
  return (
    recipe.servings != null &&
    recipe.servings > 0 &&
    Array.isArray(recipe.ingredients) &&
    recipe.ingredients.length > 0
  );
}
