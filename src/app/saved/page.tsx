"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { PageLayout } from "@/components/PageLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRecipeStore } from "@/lib/store/recipe-store";
import type { Recipe } from "@/lib/schemas/recipe";
import { buildSavedRecipeRefinePrompt } from "@/lib/utils/saved-recipe-refine";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";

import { RecipeSearch } from "./components/RecipeSearch";
import { RecipeList } from "./components/RecipeList";
import { RecipeDetail } from "./components/RecipeDetail";
import { EmptyState } from "./components/EmptyState";
import { LoadingSkeleton } from "./components/LoadingSkeleton";

export default function Saved() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setMode, setInput, setIngredients } = useRecipeStore();
  const {
    recipes,
    filteredRecipes,
    isLoading,
    loadError,
    deleteError,
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    cuisineFilter,
    setCuisineFilter,
    difficultyOptions,
    cuisineOptions,
    clearFilters,
    selectedRecipe,
    selectedRecipeId,
    selectRecipe,
    recipeToDelete,
    requestDeleteRecipe,
    cancelDeleteRecipe,
    confirmDeleteRecipe,
    refreshRecipes,
  } = useSavedRecipes({
    userId: user?.uid,
  });

  const handleRefineRecipe = useCallback(
    (recipe: Recipe): void => {
      setMode("specific");
      setInput(buildSavedRecipeRefinePrompt(recipe));
      setIngredients("");
      router.push("/generate");
    },
    [router, setIngredients, setInput, setMode]
  );

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

      {isLoading ? (
        <LoadingSkeleton />
      ) : !recipes || recipes.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ErrorBoundary variant="feature" featureName="Recipe Search">
            <RecipeSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              difficultyFilter={difficultyFilter}
              onDifficultyChange={setDifficultyFilter}
              cuisineFilter={cuisineFilter}
              onCuisineChange={setCuisineFilter}
              difficultyOptions={difficultyOptions}
              cuisineOptions={cuisineOptions}
              onClearFilters={clearFilters}
            />
          </ErrorBoundary>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ErrorBoundary variant="feature" featureName="Recipe List">
              <RecipeList
                recipes={filteredRecipes}
                selectedRecipeId={selectedRecipeId}
                onSelectRecipe={selectRecipe}
                onDeleteRecipe={requestDeleteRecipe}
              />
            </ErrorBoundary>

            <div className="lg:col-span-2 min-h-[50vh] lg:min-h-[calc(100vh-16rem)]">
              <ErrorBoundary variant="feature" featureName="Recipe Detail">
                <RecipeDetail
                  recipe={selectedRecipe}
                  userId={user.uid}
                  onScaledCopySaved={refreshRecipes}
                  onRefineRecipe={handleRefineRecipe}
                />
              </ErrorBoundary>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={recipeToDelete !== null}
        onClose={cancelDeleteRecipe}
        onConfirm={confirmDeleteRecipe}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipeToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </PageLayout>
  );
}
