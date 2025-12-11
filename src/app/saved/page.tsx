"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { getUserRecipes, deleteRecipe } from "@/lib/db";
import { Recipe } from "@/lib/types";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Trash2 } from "lucide-react";

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
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to view your saved recipes
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Saved Recipes</h1>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {loading ? (
          <div>Loading recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center text-gray-500">
            No saved recipes yet. Generate some recipes to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedRecipe?.id === recipe.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-medium text-base break-words flex-1">
                      {recipe.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(recipe.id);
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
              ))}
            </div>

            <div className="lg:col-span-2 min-h-[50vh] lg:min-h-[calc(100vh-12rem)]">
              {selectedRecipe ? (
                <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 break-words">
                    {selectedRecipe.title}
                  </h2>
                  <MarkdownRenderer content={selectedRecipe.content} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Select a recipe to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
