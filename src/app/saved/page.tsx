"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { getUserRecipes, deleteRecipe } from "@/lib/db";
import { Recipe } from "@/lib/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Trash2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Input, CardSkeleton } from "@/components/ui";

export default function SavedRecipes() {
  const { user } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    async function loadRecipes() {
      if (!user) return;
      try {
        const userRecipes = await getUserRecipes(user.uid);
        setRecipes(userRecipes);
      } catch (error) {
        console.error("Error loading recipes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, [user]);

  // Memoize filtered recipes for performance
  const filteredRecipes = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchLower)
        )
    );
  }, [recipes, searchTerm]);

  const handleDelete = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
      await deleteRecipe(recipeId);
      setRecipes(recipes.filter((r) => r.id !== recipeId));
      if (selectedRecipe?.id === recipeId) {
        setSelectedRecipe(null);
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

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
        recipes.length > 0
          ? `${recipes.length} recipe${recipes.length !== 1 ? "s" : ""} saved`
          : undefined
      }
    >
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
      ) : recipes.length === 0 ? (
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
                  onDelete={() => handleDelete(recipe.id)}
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
    </PageLayout>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function RecipeCard({
  recipe,
  isSelected,
  onSelect,
  onDelete,
}: RecipeCardProps) {
  return (
    <div
      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300 bg-white"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-base break-words flex-1">
          {recipe.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-600 shrink-0 p-1 rounded-full hover:bg-red-50 transition-colors"
          aria-label="Delete recipe"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="text-sm text-gray-500 mt-2 break-words">
        {recipe.ingredients.slice(0, 3).join(", ")}
        {recipe.ingredients.length > 3 && "..."}
      </div>
    </div>
  );
}
