"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { getUserRecipes, deleteRecipe } from "@/lib/db";
import { Recipe } from "@/lib/schemas";
import PageLayout from "@/components/PageLayout";
import { ErrorMessage, ConfirmDialog } from "@/components/ui";
import { FeatureErrorBoundary } from "@/components/FeatureErrorBoundary";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { logError } from "@/lib/utils/logger";
import {
  RecipeSearch,
  RecipeList,
  RecipeDetail,
  EmptyState,
  LoadingSkeleton,
} from "./components";

export default function SavedRecipes() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const {
    data: recipes,
    loading,
    error: loadError,
    setData: setRecipes,
    refetch,
  } = useFirestoreQuery({
    queryFn: getUserRecipes,
    userId: user?.uid,
    errorMessage: "Failed to load recipes. Please refresh the page.",
  });

  // Memoize filtered recipes for performance with empty array fallback
  const filteredRecipes = useMemo((): Recipe[] => {
    if (!recipes) return [];
    const searchLower = searchTerm.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchLower)
        )
    );
  }, [recipes, searchTerm]);

  const handleDeleteClick = useCallback((recipe: Recipe): void => {
    setRecipeToDelete(recipe);
  }, []);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!recipeToDelete) return;

    const recipeId = recipeToDelete.id;
    setDeleteError(null);

    // Close dialog first
    setRecipeToDelete(null);

    // Optimistic update: remove recipe from local state immediately
    // IMPORTANT: Use functional setState to avoid stale closure over recipes array.
    // This ensures the UI updates immediately when user deletes a recipe.
    setRecipes((currentRecipes) => {
      if (!currentRecipes) return currentRecipes;
      const updatedRecipes = currentRecipes.filter((r) => r.id !== recipeId);
      
      // Clear selected recipe if it was the one being deleted
      setSelectedRecipe((prev) => (prev?.id === recipeId ? null : prev));
      
      return updatedRecipes;
    });

    try {
      await deleteRecipe(recipeId);
    } catch (error) {
      logError("Error deleting recipe", error, { recipeId });
      setDeleteError("Failed to delete recipe. Please try again.");
      // On error, refetch from server to restore actual state
      await refetch();
    }
  }, [recipeToDelete, setRecipes, refetch]);

  if (!user) {
    return (
      <PageLayout title="Saved Recipes">
        <p className="text-gray-600">
          Please sign in to view your saved recipes.
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Saved Recipes"
      subtitle={
        recipes && recipes.length > 0
          ? `${recipes.length} recipe${recipes.length !== 1 ? "s" : ""} saved`
          : undefined
      }
    >
      {loadError && <ErrorMessage message={loadError} />}
      {deleteError && <ErrorMessage message={deleteError} />}

      {loading ? (
        <LoadingSkeleton />
      ) : !recipes || recipes.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <FeatureErrorBoundary featureName="Recipe Search">
            <RecipeSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </FeatureErrorBoundary>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <FeatureErrorBoundary featureName="Recipe List">
              <RecipeList
                recipes={filteredRecipes}
                selectedRecipeId={selectedRecipe?.id || null}
                onSelectRecipe={setSelectedRecipe}
                onDeleteRecipe={handleDeleteClick}
              />
            </FeatureErrorBoundary>

            <div className="lg:col-span-2 min-h-[50vh] lg:min-h-[calc(100vh-16rem)]">
              <FeatureErrorBoundary featureName="Recipe Detail">
                <RecipeDetail recipe={selectedRecipe} />
              </FeatureErrorBoundary>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={recipeToDelete !== null}
        onClose={() => setRecipeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipeToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </PageLayout>
  );
}
