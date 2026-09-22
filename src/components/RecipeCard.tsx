import { memo } from "react";
import { Trash2 } from "lucide-react";
import clsx from "clsx";
import type { Recipe } from "@/lib/schemas/recipe";
import { RECIPE } from "@/lib/constants/ui";

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

/**
 * Recipe card component for displaying recipe summaries in a list.
 * Shows recipe title, preview of ingredients, and delete button.
 */
export const RecipeCard = memo(function RecipeCard({
  recipe,
  isSelected,
  onSelect,
  onDelete,
}: RecipeCardProps) {
  return (
    <div
      className={clsx(
        "relative flex items-start gap-2 rounded-lg border p-3 sm:p-4 transition-colors",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-blue-300"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
        aria-label={`View recipe: ${recipe.title}`}
        aria-pressed={isSelected}
      >
        <h3 className="font-medium text-base break-words">{recipe.title}</h3>
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="text-sm text-gray-500 mt-2 break-words">
            {recipe.ingredients
              .slice(0, RECIPE.PREVIEW_INGREDIENTS_COUNT)
              .join(", ")}
            {recipe.ingredients.length > RECIPE.PREVIEW_INGREDIENTS_COUNT &&
              "..."}
          </div>
        )}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="text-red-500 hover:text-red-600 shrink-0 p-1 rounded-full hover:bg-red-50 transition-colors"
        aria-label={`Delete recipe: ${recipe.title}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
});
