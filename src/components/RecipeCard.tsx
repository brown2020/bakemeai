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
 * 
 * Memoization rationale:
 * - Renders inside .map() over potentially hundreds of recipes
 * - Prevents re-renders of unselected cards when selection changes
 * - Significant performance improvement in large recipe collections
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
        "p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300 bg-white"
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-base break-words flex-1">
          {recipe.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-600 shrink-0 p-1 rounded-full hover:bg-red-50 transition-colors"
          aria-label="Delete recipe"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className="text-sm text-gray-500 mt-2 break-words">
          {recipe.ingredients.slice(0, RECIPE.PREVIEW_INGREDIENTS_COUNT).join(", ")}
          {recipe.ingredients.length > RECIPE.PREVIEW_INGREDIENTS_COUNT && "..."}
        </div>
      )}
    </div>
  );
});
