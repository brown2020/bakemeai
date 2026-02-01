import { memo } from "react";
import { RecipeDisplayProps } from "../types";
import { Button } from "@/components/Button";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CARD_STYLES } from "../constants";

/**
 * Recipe display component with save functionality.
 * Shows generated recipe content and provides save button with state feedback.
 *
 * Memoization rationale:
 * - Parent re-renders frequently during AI streaming
 * - Prevents full component re-render when only parsedRecipe.content changes
 * - MarkdownRenderer inside handles its own memoization for content
 * - Improves streaming performance by reducing React reconciliation work
 *
 * Accessibility:
 * - Uses aria-live="polite" to announce streaming content updates to screen readers
 * - Uses aria-busy to indicate when content is being generated
 * - Region role with label provides context for assistive technologies
 */
export const RecipeDisplay = memo(function RecipeDisplay({
  parsedRecipe,
  onSave,
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
      {parsedRecipe.title && (
        <h2 className="text-xl font-medium" id="recipe-title">
          {parsedRecipe.title}
        </h2>
      )}
      <div className="mt-4" aria-labelledby={parsedRecipe.title ? "recipe-title" : undefined}>
        <MarkdownRenderer content={parsedRecipe.content} />
      </div>
      {!isGenerating && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Button
            onClick={onSave}
            disabled={isSaving || saved}
            className="min-w-[120px]"
            aria-describedby={saveError ? "save-error" : undefined}
          >
            {saved ? "Saved!" : isSaving ? "Saving..." : "Save Recipe"}
          </Button>
          {saveError && (
            <p id="save-error" className="text-sm text-red-600" role="alert">
              {saveError}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
