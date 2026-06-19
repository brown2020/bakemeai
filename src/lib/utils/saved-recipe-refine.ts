import { FORM_VALIDATION } from "@/lib/constants/ui";
import type { Recipe } from "@/lib/schemas/recipe";

function compactList(items: string[] | undefined, maxItems: number): string {
  if (!items?.length) return "";
  return items.slice(0, maxItems).join(", ");
}

function truncatePrompt(prompt: string): string {
  if (prompt.length <= FORM_VALIDATION.INPUT_MAX_LENGTH) return prompt;

  return `${prompt
    .slice(0, FORM_VALIDATION.INPUT_MAX_LENGTH - 3)
    .trimEnd()}...`;
}

/**
 * Builds an editable generate-page prompt from a saved recipe.
 */
export function buildSavedRecipeRefinePrompt(recipe: Recipe): string {
  const parts = [
    `Create a fresh variation of "${recipe.title}".`,
    "Keep the spirit of the saved recipe, but adjust flavors, technique, or presentation.",
  ];

  const ingredients = compactList(recipe.ingredients, 10);
  if (ingredients) {
    parts.push(`Reference ingredients: ${ingredients}.`);
  }

  const details: string[] = [];
  if (recipe.servings != null) {
    details.push(`${recipe.servings} serving${recipe.servings === 1 ? "" : "s"}`);
  }
  if (recipe.difficulty) details.push(recipe.difficulty);
  if (recipe.cuisine) details.push(recipe.cuisine);
  if (details.length > 0) {
    parts.push(`Original details: ${details.join(", ")}.`);
  }

  return truncatePrompt(parts.join(" "));
}
