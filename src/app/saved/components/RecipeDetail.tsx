"use client";

import { memo } from "react";

import type { Recipe } from "@/lib/schemas/recipe";
import { Button } from "@/components/Button";
import { RecipeContent } from "@/components/RecipeContent";
import { RecipeExportActions } from "@/components/RecipeExportActions";
import { NumberInput } from "@/components/ui/NumberInput";
import { useSavedRecipeServingScale } from "@/hooks/useSavedRecipeServingScale";
import { NUMBER_INPUT } from "@/lib/constants/ui";

interface RecipeDetailProps {
  recipe: Recipe | null;
  userId?: string;
  onScaledCopySaved?: () => Promise<void> | void;
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
export const RecipeDetail = memo(function RecipeDetail({
  recipe,
  userId,
  onScaledCopySaved,
}: RecipeDetailProps) {
  const {
    body,
    copyContent,
    nutrition,
    targetServings,
    setTargetServings,
    canScale,
    isScaled,
    saveScaledCopy,
    isSavingScaledCopy,
    saveScaledCopyError,
    saveScaledCopySuccess,
  } = useSavedRecipeServingScale({
    recipe,
    userId,
    onScaledCopySaved,
  });

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
      {canScale && (
        <div className="no-print mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <NumberInput
            label="Servings"
            value={targetServings}
            onChange={setTargetServings}
            min={NUMBER_INPUT.SERVING_SIZE_MIN}
            max={NUMBER_INPUT.SERVING_SIZE_MAX}
            className="w-full sm:w-32"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={saveScaledCopy}
            disabled={!isScaled || isSavingScaledCopy}
            isLoading={isSavingScaledCopy}
            className="w-full sm:w-auto"
          >
            Save scaled copy
          </Button>
        </div>
      )}
      <div className="no-print mt-4 flex flex-wrap items-center gap-2">
        <RecipeExportActions
          title={recipe.title}
          content={copyContent}
          nutrition={nutrition}
          printAriaLabel={`Print ${recipe.title}`}
          copyAriaLabel={`Copy ${recipe.title} to clipboard`}
        />
      </div>
      {saveScaledCopyError && (
        <p className="no-print mt-3 text-sm text-red-600" role="alert">
          {saveScaledCopyError}
        </p>
      )}
      {saveScaledCopySuccess && (
        <p className="no-print mt-3 text-sm text-green-700" role="status">
          Scaled copy saved.
        </p>
      )}
    </div>
  );
});
