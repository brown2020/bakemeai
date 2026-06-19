import type { RecipeStructure } from "@/lib/schemas/recipe";

export const GENERATION_HISTORY_LIMIT = 5;

function getRecipeHistoryKey(recipe: RecipeStructure): string {
  return JSON.stringify({
    title: recipe.title ?? "",
    preparationTime: recipe.preparationTime ?? "",
    cookingTime: recipe.cookingTime ?? "",
    servings: recipe.servings ?? null,
    difficulty: recipe.difficulty ?? "",
    ingredients: recipe.ingredients ?? [],
    instructions: recipe.instructions ?? [],
  });
}

/**
 * Adds a recipe snapshot to in-memory generation history.
 * Keeps newest first, caps the list, and moves duplicate snapshots to the top.
 */
export function addRecipeToGenerationHistory(
  history: RecipeStructure[],
  recipe: RecipeStructure,
  limit: number = GENERATION_HISTORY_LIMIT
): RecipeStructure[] {
  const recipeKey = getRecipeHistoryKey(recipe);
  const deduped = history.filter(
    (entry) => getRecipeHistoryKey(entry) !== recipeKey
  );

  return [recipe, ...deduped].slice(0, limit);
}
