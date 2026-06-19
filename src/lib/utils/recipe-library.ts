import type { Recipe } from "@/lib/schemas/recipe";

/**
 * Filters saved recipes by title or ingredient text.
 */
export function filterRecipesBySearch(
  recipes: Recipe[] | null | undefined,
  searchTerm: string
): Recipe[] {
  if (!recipes) return [];

  const searchLower = searchTerm.toLowerCase();
  if (!searchLower) return recipes;

  return recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchLower) ||
      (recipe.ingredients?.some((ingredient) =>
        ingredient.toLowerCase().includes(searchLower)
      ) ??
        false)
  );
}

/**
 * Returns recipes sorted newest first by Firestore timestamp seconds.
 */
export function sortRecipesByCreatedAtDesc(recipes: Recipe[]): Recipe[] {
  return [...recipes].sort(
    (a, b) => (getTimestampSeconds(b) ?? 0) - (getTimestampSeconds(a) ?? 0)
  );
}

function getTimestampSeconds(recipe: Recipe): number | null {
  const createdAt = recipe.createdAt;

  if (typeof createdAt === "number") {
    return Math.floor(createdAt / 1000);
  }

  if (
    createdAt &&
    typeof createdAt === "object" &&
    "seconds" in createdAt &&
    typeof createdAt.seconds === "number"
  ) {
    return createdAt.seconds;
  }

  return null;
}
