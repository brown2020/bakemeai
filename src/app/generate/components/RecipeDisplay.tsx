import type { ReactElement } from "react";
import { RecipeDisplayProps } from "../types";
import { Button } from "@/components/Button";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { CARD_STYLES } from "../constants";

export function RecipeDisplay({
  parsedRecipe,
  onSave,
  isSaving,
  saved,
  isGenerating,
  saveError,
}: RecipeDisplayProps): ReactElement {
  return (
    <div className={CARD_STYLES.container}>
      {parsedRecipe.title && (
        <h2 className="text-xl font-medium">{parsedRecipe.title}</h2>
      )}
      <div className="mt-4">
        <MarkdownRenderer content={parsedRecipe.content} />
      </div>
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Button
          onClick={onSave}
          disabled={isSaving || saved || isGenerating}
          className="min-w-[120px]"
        >
          {saved ? "Saved!" : isSaving ? "Saving..." : "Save Recipe"}
        </Button>
        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
      </div>
    </div>
  );
}
