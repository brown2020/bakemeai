import { memo } from "react";
import { Input } from "@/components/ui/Input";

interface RecipeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

/**
 * Search input component for filtering saved recipes.
 * 
 * Memoization rationale:
 * - Parent re-renders frequently (selection changes, delete operations)
 * - Search state is independent of recipe list changes
 * - Prevents input flicker/blur during parent updates
 * - Minimal component, but improves UX consistency
 */
export const RecipeSearch = memo(function RecipeSearch({ 
  searchTerm, 
  onSearchChange 
}: RecipeSearchProps) {
  return (
    <div className="mb-6 max-w-xs">
      <Input
        type="text"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
});
