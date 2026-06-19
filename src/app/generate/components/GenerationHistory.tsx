"use client";

import { History, Trash2 } from "lucide-react";

import { Button } from "@/components/Button";
import type { RecipeStructure } from "@/lib/schemas/recipe";

interface GenerationHistoryProps {
  recipes: RecipeStructure[];
  selectedRecipe: RecipeStructure | null;
  onSelectRecipe: (recipe: RecipeStructure) => void;
  onClearHistory: () => void;
}

function getHistoryLabel(recipe: RecipeStructure, index: number): string {
  return recipe.title?.trim() || `Recipe ${index + 1}`;
}

function getHistoryMeta(recipe: RecipeStructure): string {
  const parts: string[] = [];
  if (recipe.servings != null) {
    parts.push(`${recipe.servings} serving${recipe.servings === 1 ? "" : "s"}`);
  }
  if (recipe.difficulty) parts.push(recipe.difficulty);
  return parts.join(" / ");
}

/**
 * Session-only list of recent generated recipes.
 */
export function GenerationHistory({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  onClearHistory,
}: GenerationHistoryProps) {
  if (recipes.length === 0) return null;

  return (
    <section
      className="no-print rounded-lg border border-surface-200 bg-white p-4 shadow-sm"
      aria-labelledby="generation-history-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary-600" aria-hidden="true" />
          <h2
            id="generation-history-title"
            className="text-base font-semibold text-gray-900"
          >
            Recent generations
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="w-full sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
          Clear
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {recipes.map((recipe, index) => {
          const isSelected = recipe === selectedRecipe;
          const meta = getHistoryMeta(recipe);

          return (
            <button
              key={`${getHistoryLabel(recipe, index)}-${index}`}
              type="button"
              onClick={() => onSelectRecipe(recipe)}
              className={`max-w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50"
              }`}
              aria-pressed={isSelected}
            >
              <span className="block max-w-48 truncate font-medium">
                {getHistoryLabel(recipe, index)}
              </span>
              {meta && (
                <span className="mt-1 block text-xs text-gray-500">
                  {meta}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
