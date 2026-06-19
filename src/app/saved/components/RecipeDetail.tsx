import { memo, useMemo } from "react";
import type { Recipe } from "@/lib/schemas/recipe";
import { RecipeContent } from "@/components/RecipeContent";
import { RecipeExportActions } from "@/components/RecipeExportActions";
import { extractNutritionSummary } from "@/lib/utils/nutrition";
import { stripLeadingTitleHeading } from "@/lib/utils/markdown";

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
  const nutrition = useMemo(
    () => (recipe ? extractNutritionSummary(recipe) : null),
    [recipe]
  );

  // Saved content begins with `# <title>` (from convertToMarkdown); strip it so
  // the title isn't rendered twice alongside the heading below.
  const body = useMemo(
    () => (recipe ? stripLeadingTitleHeading(recipe.content, recipe.title) : ""),
    [recipe]
  );

  if (!recipe) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        Select a recipe to view details
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-surface-200">
      <RecipeContent
        title={recipe.title}
        content={body}
        nutrition={nutrition}
        titleClassName="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 break-words"
        contentClassName=""
      />
      <div className="no-print mt-4 flex flex-wrap items-center gap-2">
        <RecipeExportActions
          title={recipe.title}
          content={recipe.content}
          nutrition={nutrition}
          printAriaLabel={`Print ${recipe.title}`}
          copyAriaLabel={`Copy ${recipe.title} to clipboard`}
        />
      </div>
    </div>
  );
});
