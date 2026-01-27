import { Input } from "@/components/ui";

interface RecipeSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

/**
 * Search input component for filtering saved recipes.
 */
export function RecipeSearch({ searchTerm, onSearchChange }: RecipeSearchProps) {
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
}
