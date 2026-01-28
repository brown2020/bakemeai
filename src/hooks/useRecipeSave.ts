import { useCallback } from "react";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { saveRecipeToDatabase } from "@/lib/services/recipe-service";
import { ERROR_MESSAGES } from "@/lib/utils/error-handler";

/**
 * Custom hook for saving recipes to the database.
 * Separates business logic from state management.
 * 
 * @returns Save handler and state
 */
export function useRecipeSave() {
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
      if (!userId) {
        setSaveError(ERROR_MESSAGES.AUTH.LOGIN_REQUIRED);
        return;
      }

      if (!structuredRecipe) {
        setSaveError(ERROR_MESSAGES.RECIPE.NO_RECIPE_TO_SAVE);
        return;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        await saveRecipeToDatabase(userId, structuredRecipe);
        setSaved(true);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : ERROR_MESSAGES.RECIPE.SAVE_FAILED);
      } finally {
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
