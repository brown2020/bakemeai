interface PageSkeletonProps {
  /** Number of skeleton rows to show */
  rows?: number;
  /** Whether to show a title skeleton */
  showTitle?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Consistent loading skeleton for page content.
 */
export function PageSkeleton({
  rows = 3,
  showTitle = true,
  className = "",
}: PageSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {showTitle && <div className="h-8 bg-gray-200 rounded-lg w-1/3" />}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Card-style skeleton for list items.
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse p-4 bg-white rounded-lg border border-gray-200"
        >
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}



