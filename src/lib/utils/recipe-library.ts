import type { Recipe } from "@/lib/schemas/recipe";

export interface RecipeLibraryFilters {
  searchTerm?: string;
  difficulty?: string;
  cuisine?: string;
}

/**
 * Filters saved recipes by title or ingredient text.
 */
export function filterRecipesBySearch(
  recipes: Recipe[] | null | undefined,
  searchTerm: string
): Recipe[] {
  return filterRecipes(recipes, { searchTerm });
}

/**
 * Filters saved recipes by text and structured metadata.
 */
export function filterRecipes(
  recipes: Recipe[] | null | undefined,
  filters: RecipeLibraryFilters
): Recipe[] {
  if (!recipes) return [];

  const searchLower = filters.searchTerm?.trim().toLowerCase() ?? "";
  const difficulty = filters.difficulty?.trim() ?? "";
  const cuisine = filters.cuisine?.trim() ?? "";

  return recipes.filter(
    (recipe) =>
      matchesSearch(recipe, searchLower) &&
      matchesExact(recipe.difficulty, difficulty) &&
      matchesExact(recipe.cuisine, cuisine)
  );
}

/**
 * Returns sorted unique values for a saved recipe metadata field.
 */
export function getRecipeMetadataOptions(
  recipes: Recipe[] | null | undefined,
  field: "difficulty" | "cuisine"
): string[] {
  if (!recipes) return [];

  const values = new Set<string>();
  recipes.forEach((recipe) => {
    const value = recipe[field]?.trim();
    if (value) values.add(value);
  });

  return [...values].sort((a, b) => a.localeCompare(b));
}

/**
 * Returns recipes sorted newest first by Firestore timestamp seconds.
 */
export function sortRecipesByCreatedAtDesc(recipes: Recipe[]): Recipe[] {
  return [...recipes].sort(
    (a, b) => (getTimestampSeconds(b) ?? 0) - (getTimestampSeconds(a) ?? 0)
  );
}

function matchesSearch(recipe: Recipe, searchLower: string): boolean {
  if (!searchLower) return true;

  return (
    recipe.title.toLowerCase().includes(searchLower) ||
    (recipe.ingredients?.some((ingredient) =>
      ingredient.toLowerCase().includes(searchLower)
    ) ??
      false)
  );
}

function matchesExact(value: string | undefined, selected: string): boolean {
  if (!selected) return true;
  return value === selected;
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
