import { memo } from "react";
import { RefreshCw } from "lucide-react";

import { RecipeDisplayProps } from "../types";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { PrintRecipeButton } from "@/components/PrintRecipeButton";
import { FORM_VALIDATION } from "@/lib/constants/ui";
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
  isSaving,
  saved,
  isGenerating,
  saveError,
}: RecipeDisplayProps) {
  return (
    <div
      className={CARD_STYLES.container}
      role="region"
      aria-label="Generated recipe"
      aria-live="polite"
      aria-busy={isGenerating}
    >
      <div className="recipe-printable">
        {parsedRecipe.title && (
          <h2 className="text-xl font-medium" id="recipe-title">
            {parsedRecipe.title}
          </h2>
        )}
        <div
          className="mt-4"
          aria-labelledby={parsedRecipe.title ? "recipe-title" : undefined}
        >
          <MarkdownRenderer content={parsedRecipe.content} />
        </div>
      </div>
      {!isGenerating && (
        <div className="no-print mt-4 space-y-4">
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
