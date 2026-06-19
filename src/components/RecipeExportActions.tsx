"use client";

import { useCallback } from "react";

import { CopyRecipeButton } from "@/components/CopyRecipeButton";
import { PrintRecipeButton } from "@/components/PrintRecipeButton";
import type { NutritionSummary } from "@/lib/utils/nutrition";
import { buildRecipeCopyText } from "@/lib/utils/recipe-copy";

interface RecipeExportActionsProps {
  title: string;
  content: string;
  nutrition?: NutritionSummary | null;
  printAriaLabel?: string;
  copyAriaLabel?: string;
}

/**
 * Shared print/copy actions for any rendered recipe body.
 */
export function RecipeExportActions({
  title,
  content,
  nutrition,
  printAriaLabel,
  copyAriaLabel,
}: RecipeExportActionsProps) {
  const getCopyText = useCallback(
    () =>
      buildRecipeCopyText({
        title,
        content,
        nutrition,
      }),
    [title, content, nutrition]
  );

  return (
    <>
      <PrintRecipeButton ariaLabel={printAriaLabel} />
      <CopyRecipeButton getText={getCopyText} ariaLabel={copyAriaLabel} />
    </>
  );
}
