/**
 * Empty state component shown when user has no saved recipes.
 */
export function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <p className="text-lg">No saved recipes yet.</p>
      <p className="mt-2">Generate some recipes to get started!</p>
    </div>
  );
}
