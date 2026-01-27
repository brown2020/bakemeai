import { memo } from "react";
import { Recipe } from "@/lib/schemas";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface RecipeDetailProps {
  recipe: Recipe | null;
}

/**
 * Detail view for the selected recipe displayed in the right panel.
 * Shows the full recipe content with markdown formatting.
 * 
 * Memoization rationale:
 * - Contains expensive MarkdownRenderer (which has its own memoization)
 * - Parent re-renders on every list interaction (hover, click)
 * - Only needs to re-render when selected recipe actually changes
 * - Prevents expensive markdown re-parsing on unrelated updates
 */
export const RecipeDetail = memo(function RecipeDetail({ recipe }: RecipeDetailProps) {
  if (!recipe) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        Select a recipe to view details
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-surface-200">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 break-words">
        {recipe.title}
      </h2>
      <MarkdownRenderer content={recipe.content} />
    </div>
  );
});
