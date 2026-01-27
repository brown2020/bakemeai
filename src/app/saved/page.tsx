"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { getUserRecipes, deleteRecipe } from "@/lib/db";
import { Recipe } from "@/lib/schemas";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import PageLayout from "@/components/PageLayout";
import { Input, CardSkeleton, ErrorMessage, ConfirmDialog } from "@/components/ui";
import { RecipeCard } from "@/components/RecipeCard";
import { useLoadData } from "@/hooks/useLoadData";
import { logError } from "@/lib/utils/logger";

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
  } = useLoadData({
    loadFn: getUserRecipes,
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
    if (!recipeToDelete || !recipes) return;

    const recipeId = recipeToDelete.id;
    setDeleteError(null);
    try {
      await deleteRecipe(recipeId);
      // Note: In a production app with proper cache management,
      // you'd invalidate the cache here instead of local state manipulation
      setSelectedRecipe((prev) => (prev?.id === recipeId ? null : prev));
      setRecipeToDelete(null);
    } catch (error) {
      logError("Error deleting recipe", error, { recipeId });
      setDeleteError("Failed to delete recipe. Please try again.");
    }
  }, [recipeToDelete, recipes]);

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
      {/* Error Messages */}
      {loadError && <ErrorMessage message={loadError} />}
      {deleteError && <ErrorMessage message={deleteError} />}

      {/* Search */}
      <div className="mb-6 max-w-xs">
        <Input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CardSkeleton count={4} />
          </div>
          <div className="lg:col-span-2">
            <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ) : !recipes || recipes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No saved recipes yet.</p>
          <p className="mt-2">Generate some recipes to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipe List */}
          <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {filteredRecipes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No recipes match your search.
              </p>
            ) : (
              filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSelected={selectedRecipe?.id === recipe.id}
                  onSelect={() => setSelectedRecipe(recipe)}
                  onDelete={() => handleDeleteClick(recipe)}
                />
              ))
            )}
          </div>

          {/* Recipe Detail */}
          <div className="lg:col-span-2 min-h-[50vh] lg:min-h-[calc(100vh-16rem)]">
            {selectedRecipe ? (
              <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-surface-200">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 break-words">
                  {selectedRecipe.title}
                </h2>
                <MarkdownRenderer content={selectedRecipe.content} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                Select a recipe to view details
              </div>
            )}
          </div>
        </div>
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
