import { useCallback, useRef } from "react";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { saveRecipeToDatabase } from "@/lib/services/recipe-service";
import { ERROR_MESSAGES, convertErrorToMessage } from "@/lib/utils/error-handler";

/**
 * Custom hook for saving recipes to the database.
 * Separates business logic from state management.
 *
 * Includes duplicate save prevention using a ref for instant checking
 * (state updates are async and can't prevent concurrent calls).
 *
 * @returns Save handler and state
 */
export function useRecipeSave() {
  // Ref for instant save-in-progress check (state is async)
  const savingRef = useRef(false);

  const {
    structuredRecipe,
    isSaving,
    saveError,
    saved,
    setIsSaving,
    setSaveError,
    setSaved,
  } = useRecipeStore();

  const saveRecipe = useCallback(
    async (userId: string) => {
      // Immediate guard using ref to prevent duplicate saves
      // (state updates are async and can't prevent concurrent calls)
      if (savingRef.current) return;

      if (!userId) {
        setSaveError(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED);
        return;
      }

      if (!structuredRecipe) {
        setSaveError(ERROR_MESSAGES.RECIPE.NO_RECIPE_TO_SAVE);
        return;
      }

      savingRef.current = true;
      setIsSaving(true);
      setSaveError(null);

      try {
        await saveRecipeToDatabase(userId, structuredRecipe);
        setSaved(true);
      } catch (error) {
        // Use standardized error conversion for consistent Firebase error mapping
        setSaveError(convertErrorToMessage(error, ERROR_MESSAGES.RECIPE.SAVE_FAILED));
      } finally {
        savingRef.current = false;
        setIsSaving(false);
      }
    },
    [structuredRecipe, setIsSaving, setSaveError, setSaved]
  );

  return {
    saveRecipe,
    isSaving,
    saveError,
    saved,
  };
}
