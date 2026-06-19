"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Recipe, RecipeStructure } from "@/lib/schemas/recipe";
import { NUMBER_INPUT, UI_TIMING } from "@/lib/constants/ui";
import { saveRecipeToDatabase } from "@/lib/services/recipe-service";
import { convertToMarkdown, formatRecipeBodyAsMarkdown, stripLeadingTitleHeading } from "@/lib/utils/markdown";
import type { NutritionSummary } from "@/lib/utils/nutrition";
import { extractNutritionSummary } from "@/lib/utils/nutrition";
import {
  canScaleRecipeServings,
  scaleRecipeServings,
} from "@/lib/utils/recipe-servings";
import { getCompleteStructureFromSavedRecipe } from "@/lib/utils/saved-recipe";
import { ERROR_MESSAGES, convertErrorToMessage } from "@/lib/utils/error-handler";
import { logError } from "@/lib/utils/logger";

interface UseSavedRecipeServingScaleOptions {
  recipe: Recipe | null;
  userId?: string;
  onScaledCopySaved?: () => Promise<void> | void;
}

interface UseSavedRecipeServingScaleReturn {
  body: string;
  copyContent: string;
  nutrition: NutritionSummary | null;
  targetServings: number;
  setTargetServings: (servings: number) => void;
  canScale: boolean;
  isScaled: boolean;
  saveScaledCopy: () => Promise<void>;
  isSavingScaledCopy: boolean;
  saveScaledCopyError: string | null;
  saveScaledCopySuccess: boolean;
}

/**
 * Manages display-only serving scaling for a selected saved recipe.
 */
export function useSavedRecipeServingScale({
  recipe,
  userId,
  onScaledCopySaved,
}: UseSavedRecipeServingScaleOptions): UseSavedRecipeServingScaleReturn {
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [targetServings, setTargetServings] = useState<number>(
    NUMBER_INPUT.SERVING_SIZE_DEFAULT
  );
  const [isSavingScaledCopy, setIsSavingScaledCopy] = useState(false);
  const [saveScaledCopyError, setSaveScaledCopyError] = useState<string | null>(
    null
  );
  const [saveScaledCopySuccess, setSaveScaledCopySuccess] = useState(false);

  const savedStructure = useMemo(
    () => (recipe ? getCompleteStructureFromSavedRecipe(recipe) : null),
    [recipe]
  );

  const defaultServings =
    savedStructure?.servings ??
    recipe?.servings ??
    NUMBER_INPUT.SERVING_SIZE_DEFAULT;

  useEffect(() => {
    setTargetServings(defaultServings);
    setSaveScaledCopyError(null);
    setSaveScaledCopySuccess(false);
  }, [defaultServings, recipe?.id]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const canScale =
    savedStructure != null && canScaleRecipeServings(savedStructure);
  const isScaled =
    canScale &&
    savedStructure?.servings != null &&
    targetServings !== savedStructure.servings;

  const scaledRecipe: RecipeStructure | null = useMemo(() => {
    if (!savedStructure || !isScaled) return null;
    return scaleRecipeServings(savedStructure, targetServings);
  }, [isScaled, savedStructure, targetServings]);

  const body = useMemo(() => {
    if (scaledRecipe) return formatRecipeBodyAsMarkdown(scaledRecipe);
    if (!recipe) return "";
    return stripLeadingTitleHeading(recipe.content, recipe.title);
  }, [recipe, scaledRecipe]);

  const copyContent = useMemo(() => {
    if (scaledRecipe) return convertToMarkdown(scaledRecipe);
    return recipe?.content ?? "";
  }, [recipe, scaledRecipe]);

  const nutrition = useMemo(
    () => extractNutritionSummary(scaledRecipe ?? recipe),
    [recipe, scaledRecipe]
  );

  const saveScaledCopy = useCallback(async (): Promise<void> => {
    if (!userId) {
      setSaveScaledCopyError(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED);
      return;
    }

    if (!scaledRecipe) return;

    setIsSavingScaledCopy(true);
    setSaveScaledCopyError(null);
    setSaveScaledCopySuccess(false);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);

    try {
      await saveRecipeToDatabase(userId, scaledRecipe);
      try {
        await onScaledCopySaved?.();
      } catch (refreshError) {
        logError("Failed to refresh recipes after saving scaled copy", refreshError, {
          userId,
          recipeTitle: scaledRecipe.title,
        });
      }
      setSaveScaledCopySuccess(true);
      successTimerRef.current = setTimeout(
        () => setSaveScaledCopySuccess(false),
        UI_TIMING.SUCCESS_MESSAGE_DURATION
      );
    } catch (error) {
      setSaveScaledCopyError(
        convertErrorToMessage(error, ERROR_MESSAGES.RECIPE.SAVE_FAILED)
      );
    } finally {
      setIsSavingScaledCopy(false);
    }
  }, [onScaledCopySaved, scaledRecipe, userId]);

  return {
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
  };
}
