import { useCallback } from "react";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { saveRecipeToDatabase } from "@/lib/services/recipe-service";

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
        setSaveError("You must be logged in to save recipes");
        return;
      }

      if (!structuredRecipe) {
        setSaveError("No recipe to save. Please generate a recipe first.");
        return;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        await saveRecipeToDatabase(userId, structuredRecipe);
        setSaved(true);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Failed to save recipe");
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
