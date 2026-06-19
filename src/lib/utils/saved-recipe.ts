import type {
  CompleteRecipeStructure,
  Recipe,
} from "@/lib/schemas/recipe";
import { completeRecipeStructureSchema } from "@/lib/schemas/recipe";

/**
 * Returns complete structured recipe data from a saved recipe when available.
 * Legacy recipes may only have markdown content, so callers must handle null.
 */
export function getCompleteStructureFromSavedRecipe(
  recipe: Recipe
): CompleteRecipeStructure | null {
  const candidate = {
    title: recipe.title,
    preparationTime: recipe.preparationTime,
    cookingTime: recipe.cookingTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    ...(recipe.tips != null ? { tips: recipe.tips } : {}),
    ...(recipe.calories != null ? { calories: recipe.calories } : {}),
    ...(recipe.macros != null ? { macros: recipe.macros } : {}),
  };

  const result = completeRecipeStructureSchema.safeParse(candidate);
  return result.success ? result.data : null;
}
