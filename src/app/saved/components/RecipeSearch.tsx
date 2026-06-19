import { memo } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/Button";
import { Input } from "@/components/ui/Input";

interface RecipeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: string;
  onDifficultyChange: (value: string) => void;
  cuisineFilter: string;
  onCuisineChange: (value: string) => void;
  difficultyOptions: string[];
  cuisineOptions: string[];
  onClearFilters: () => void;
}

/**
 * Search controls for filtering saved recipes.
 *
 * Memoization rationale:
 * - Parent re-renders frequently (selection changes, delete operations)
 * - Search state is independent of recipe list changes
 * - Prevents input flicker/blur during parent updates
 * - Minimal component, but improves UX consistency
 */
export const RecipeSearch = memo(function RecipeSearch({
  searchTerm,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  cuisineFilter,
  onCuisineChange,
  difficultyOptions,
  cuisineOptions,
  onClearFilters,
}: RecipeSearchProps) {
  const hasFilters = Boolean(searchTerm || difficultyFilter || cuisineFilter);

  return (
    <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] md:items-end">
      <Input
        type="text"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">
          Difficulty
        </span>
        <select
          value={difficultyFilter}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="w-full rounded-lg border p-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any difficulty</option>
          {difficultyOptions.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">
          Cuisine
        </span>
        <select
          value={cuisineFilter}
          onChange={(e) => onCuisineChange(e.target.value)}
          className="w-full rounded-lg border p-2 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any cuisine</option>
          {cuisineOptions.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </select>
      </label>
      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={onClearFilters}
          className="w-full md:w-auto"
        >
          <X className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
          Clear
        </Button>
      )}
    </div>
  );
});
