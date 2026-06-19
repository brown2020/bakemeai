import { memo } from "react";

import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { NutritionSummaryPanel } from "@/components/NutritionSummaryPanel";
import type { NutritionSummary } from "@/lib/utils/nutrition";

interface RecipeContentProps {
  title?: string | null;
  content: string;
  nutrition?: NutritionSummary | null;
  titleId?: string;
  titleClassName?: string;
  contentClassName?: string;
}

/**
 * Shared printable recipe body used by generated and saved recipe views.
 */
export const RecipeContent = memo(function RecipeContent({
  title,
  content,
  nutrition,
  titleId,
  titleClassName = "text-xl font-medium",
  contentClassName = "mt-4",
}: RecipeContentProps) {
  const hasTitle = Boolean(title);

  return (
    <div className="recipe-printable">
      {hasTitle && (
        <h2 className={titleClassName} id={titleId}>
          {title}
        </h2>
      )}
      {nutrition && <NutritionSummaryPanel summary={nutrition} />}
      <div
        className={contentClassName}
        aria-labelledby={hasTitle ? titleId : undefined}
      >
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
});
