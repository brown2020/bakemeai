import { memo, useCallback } from "react";
import { RefreshCw } from "lucide-react";

import { RecipeDisplayProps } from "../types";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { RecipeContent } from "@/components/RecipeContent";
import { PrintRecipeButton } from "@/components/PrintRecipeButton";
import { CopyRecipeButton } from "@/components/CopyRecipeButton";
import { FORM_VALIDATION, NUMBER_INPUT } from "@/lib/constants/ui";
import { extractNutritionSummary } from "@/lib/utils/nutrition";
import { buildRecipeCopyText } from "@/lib/utils/recipe-copy";
import { CARD_STYLES } from "../constants";

/**
 * Recipe display component with save, print, and regenerate functionality.
 */
export const RecipeDisplay = memo(function RecipeDisplay({
  parsedRecipe,
  onSave,
  onRegenerate,
  tweak,
  onTweakChange,
  targetServings,
  onTargetServingsChange,
  onApplyServingScale,
  canScaleServings,
  isServingScalePending,
  isSaving,
  saved,
  isGenerating,
  saveError,
}: RecipeDisplayProps) {
  const nutrition = extractNutritionSummary(parsedRecipe.structuredData);

  const getCopyText = useCallback(
    () =>
      buildRecipeCopyText({
        title: parsedRecipe.title,
        content: parsedRecipe.content,
        nutrition,
      }),
    [parsedRecipe.title, parsedRecipe.content, nutrition]
  );

  return (
    <div
      className={CARD_STYLES.container}
      role="region"
      aria-label="Generated recipe"
      aria-live="polite"
      aria-busy={isGenerating}
    >
      <RecipeContent
        title={parsedRecipe.title}
        content={parsedRecipe.content}
        nutrition={nutrition}
        titleId="recipe-title"
      />
      {!isGenerating && (
        <div className="no-print mt-4 space-y-4">
          {canScaleServings && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <NumberInput
                label="Servings"
                value={targetServings}
                onChange={onTargetServingsChange}
                min={NUMBER_INPUT.SERVING_SIZE_MIN}
                max={NUMBER_INPUT.SERVING_SIZE_MAX}
                className="w-full sm:w-32"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={onApplyServingScale}
                disabled={!isServingScalePending}
                className="w-full sm:w-auto"
              >
                Update servings
              </Button>
            </div>
          )}
          <Input
            label="Tweak this recipe (optional)"
            placeholder="e.g., make it spicier, serve 2..."
            value={tweak}
            onChange={(e) => onTweakChange(e.target.value)}
            maxLength={FORM_VALIDATION.INPUT_MAX_LENGTH}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onRegenerate}
              className="min-w-[120px]"
            >
              <RefreshCw className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
              Regenerate
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving || saved}
              className="min-w-[120px]"
              aria-describedby={saveError ? "save-error" : undefined}
            >
              {saved ? "Saved!" : isSaving ? "Saving..." : "Save Recipe"}
            </Button>
            <PrintRecipeButton />
            <CopyRecipeButton getText={getCopyText} />
            {saveError && (
              <p id="save-error" className="text-sm text-red-600" role="alert">
                {saveError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
