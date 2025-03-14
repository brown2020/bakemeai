import { useState, useCallback, createContext, useContext } from "react";
import { saveRecipe } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { ProviderProps, RecipeSavingContextType } from "../types";

const RecipeSavingContext = createContext<RecipeSavingContextType | null>(null);

export function RecipeSavingProvider({ children }: ProviderProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const saveRecipeToDb = useCallback(async (recipe: string) => {
    if (!auth.currentUser) {
      setSaveError("You must be logged in to save recipes");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await saveRecipe(auth.currentUser.uid, recipe);
      setSaved(true);
    } catch (error) {
      console.error("Error saving recipe:", error);
      setSaveError("Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  }, []);

  const resetSaveState = useCallback(() => {
    setSaved(false);
    setSaveError("");
  }, []);

  const value = {
    isSaving,
    saveError,
    saved,
    saveRecipeToDb,
    resetSaveState,
  };

  return (
    <RecipeSavingContext.Provider value={value}>
      {children}
    </RecipeSavingContext.Provider>
  );
}

export function useRecipeSaving() {
  const context = useContext(RecipeSavingContext);

  if (!context) {
    throw new Error(
      "useRecipeSaving must be used within a RecipeSavingProvider"
    );
  }

  return context;
}
