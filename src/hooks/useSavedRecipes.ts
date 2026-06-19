"use client";

import { useCallback, useMemo, useState } from "react";

import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { getUserRecipes } from "@/lib/db";
import { deleteRecipeFromDatabase } from "@/lib/services/recipe-service";
import type { Recipe } from "@/lib/schemas/recipe";
import { ERROR_MESSAGES, convertErrorToMessage } from "@/lib/utils/error-handler";
import { logError } from "@/lib/utils/logger";
import {
  filterRecipesBySearch,
  sortRecipesByCreatedAtDesc,
} from "@/lib/utils/recipe-library";

interface UseSavedRecipesOptions {
  userId?: string;
}

interface UseSavedRecipesReturn {
  recipes: Recipe[] | null;
  filteredRecipes: Recipe[];
  isLoading: boolean;
  loadError: string | null;
  deleteError: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedRecipe: Recipe | null;
  selectedRecipeId: string | null;
  selectRecipe: (recipe: Recipe) => void;
  recipeToDelete: Recipe | null;
  requestDeleteRecipe: (recipe: Recipe) => void;
  cancelDeleteRecipe: () => void;
  confirmDeleteRecipe: () => Promise<void>;
}

/**
 * Orchestrates saved recipe library state, search, and optimistic deletion.
 */
export function useSavedRecipes({
  userId,
}: UseSavedRecipesOptions): UseSavedRecipesReturn {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const {
    data: recipes,
    isLoading,
    error: loadError,
    setData: setRecipes,
    refetch,
  } = useFirestoreQuery({
    queryFn: getUserRecipes,
    userId,
    errorMessage: "Failed to load recipes. Please refresh the page.",
  });

  const filteredRecipes = useMemo(
    () => filterRecipesBySearch(recipes, searchTerm),
    [recipes, searchTerm]
  );

  const selectedRecipe = useMemo(
    () => recipes?.find((recipe) => recipe.id === selectedRecipeId) ?? null,
    [recipes, selectedRecipeId]
  );

  const selectRecipe = useCallback((recipe: Recipe): void => {
    setSelectedRecipeId(recipe.id);
  }, []);

  const requestDeleteRecipe = useCallback((recipe: Recipe): void => {
    setRecipeToDelete(recipe);
  }, []);

  const cancelDeleteRecipe = useCallback((): void => {
    setRecipeToDelete(null);
  }, []);

  const confirmDeleteRecipe = useCallback(async (): Promise<void> => {
    if (!recipeToDelete) return;

    const recipeId = recipeToDelete.id;
    const deletedRecipe = recipeToDelete;

    setDeleteError(null);
    setRecipeToDelete(null);
    setSelectedRecipeId((currentId) =>
      currentId === recipeId ? null : currentId
    );

    setRecipes((currentRecipes) => {
      if (!currentRecipes) return [];
      return currentRecipes.filter((recipe) => recipe.id !== recipeId);
    });

    try {
      await deleteRecipeFromDatabase(recipeId);
    } catch (error) {
      const message = convertErrorToMessage(
        error,
        ERROR_MESSAGES.RECIPE.DELETE_FAILED
      );
      setDeleteError(message);

      try {
        await refetch();
      } catch (refetchError) {
        logError("Error refetching after failed delete", refetchError, {
          recipeId,
        });
        setRecipes((currentRecipes) => {
          if (!currentRecipes) return [deletedRecipe];
          return sortRecipesByCreatedAtDesc([...currentRecipes, deletedRecipe]);
        });
        setDeleteError(
          `${message} The page may be out of sync. Please refresh to see the current state.`
        );
      }
    }
  }, [recipeToDelete, refetch, setRecipes]);

  return {
    recipes,
    filteredRecipes,
    isLoading,
    loadError,
    deleteError,
    searchTerm,
    setSearchTerm,
    selectedRecipe,
    selectedRecipeId,
    selectRecipe,
    recipeToDelete,
    requestDeleteRecipe,
    cancelDeleteRecipe,
    confirmDeleteRecipe,
  };
}
