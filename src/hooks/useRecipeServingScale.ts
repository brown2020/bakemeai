import { useCallback, useMemo, useState } from "react";

import type { RecipeStructure } from "@/lib/schemas/recipe";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { NUMBER_INPUT } from "@/lib/constants/ui";
import {
  canScaleRecipeServings,
  scaleRecipeServings,
} from "@/lib/utils/recipe-servings";

interface UseRecipeServingScaleOptions {
  structuredRecipe: RecipeStructure | null;
  isGenerating: boolean;
}

interface UseRecipeServingScaleReturn {
  targetServings: number;
  setTargetServings: (servings: number) => void;
  applyServingScale: () => void;
  canScale: boolean;
  isScaled: boolean;
}

function getRecipeScaleIdentity(recipe: RecipeStructure | null): string {
  if (!recipe?.title || recipe.servings == null) return "";
  return `${recipe.title}:${recipe.servings}`;
}

/**
 * Manages serving-size adjustment for a generated recipe on /generate.
 */
export function useRecipeServingScale({
  structuredRecipe,
  isGenerating,
}: UseRecipeServingScaleOptions): UseRecipeServingScaleReturn {
  const { setStructuredRecipe, resetSaveState } = useRecipeStore();
  const [targetOverrides, setTargetOverrides] = useState<Record<string, number>>(
    {}
  );

  const recipeIdentity = useMemo(
    () => (isGenerating ? "" : getRecipeScaleIdentity(structuredRecipe)),
    [isGenerating, structuredRecipe]
  );

  const defaultTarget =
    structuredRecipe?.servings ?? NUMBER_INPUT.SERVING_SIZE_DEFAULT;

  const targetServings =
    recipeIdentity && targetOverrides[recipeIdentity] != null
      ? targetOverrides[recipeIdentity]
      : defaultTarget;

  const setTargetServings = useCallback(
    (servings: number) => {
      if (!recipeIdentity) return;
      setTargetOverrides((prev) => ({
        ...prev,
        [recipeIdentity]: servings,
      }));
    },
    [recipeIdentity]
  );

  const canScale =
    !isGenerating &&
    structuredRecipe != null &&
    canScaleRecipeServings(structuredRecipe);

  const isScaled =
    canScale &&
    structuredRecipe.servings != null &&
    targetServings !== structuredRecipe.servings;

  const applyServingScale = useCallback(() => {
    if (!structuredRecipe || !canScaleRecipeServings(structuredRecipe)) return;
    if (targetServings === structuredRecipe.servings) return;

    const scaled = scaleRecipeServings(structuredRecipe, targetServings);
    const scaledIdentity = getRecipeScaleIdentity(scaled);

    setStructuredRecipe(scaled);
    resetSaveState();

    if (scaledIdentity) {
      setTargetOverrides((prev) => ({
        ...prev,
        [scaledIdentity]: scaled.servings ?? targetServings,
      }));
    }
  }, [
    structuredRecipe,
    targetServings,
    setStructuredRecipe,
    resetSaveState,
  ]);

  return {
    targetServings,
    setTargetServings,
    applyServingScale,
    canScale,
    isScaled,
  };
}
