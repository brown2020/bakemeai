import { CardSkeleton } from "@/components/ui/PageSkeleton";

/**
 * Loading skeleton for the saved recipes page.
 * Displays placeholder content while data is being fetched.
 */
export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <CardSkeleton count={4} />
      </div>
      <div className="lg:col-span-2">
        <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}
