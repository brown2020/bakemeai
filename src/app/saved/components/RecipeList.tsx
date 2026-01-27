import { memo } from "react";
import { Recipe } from "@/lib/schemas";
import { RecipeCard } from "@/components/RecipeCard";

interface RecipeListProps {
  recipes: Recipe[];
  selectedRecipeId: string | null;
  onSelectRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (recipe: Recipe) => void;
}

/**
 * List of recipe cards displayed in the left panel.
 * Handles recipe selection and deletion actions.
 * 
 * Memoization rationale:
 * - Renders entire recipe collection (could be 100+ items)
 * - Parent re-renders on various state changes (search, delete confirmation)
 * - RecipeCard children are also memoized for granular optimization
 * - Together creates efficient virtualization-like behavior
 * - Critical for performance with large recipe collections
 */
export const RecipeList = memo(function RecipeList({
  recipes,
  selectedRecipeId,
  onSelectRecipe,
  onDeleteRecipe,
}: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No recipes match your search.
      </p>
    );
  }

  return (
    <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          isSelected={selectedRecipeId === recipe.id}
          onSelect={() => onSelectRecipe(recipe)}
          onDelete={() => onDeleteRecipe(recipe)}
        />
      ))}
    </div>
  );
});
