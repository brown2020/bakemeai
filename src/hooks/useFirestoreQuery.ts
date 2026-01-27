import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { logError } from "@/lib/utils/logger";

interface UseFirestoreQueryOptions<T> {
  /** The async function to fetch data from Firestore */
  queryFn: (userId: string) => Promise<T>;
  /** User ID to pass to queryFn */
  userId?: string;
  /** User-facing error message to display on failure */
  errorMessage: string;
  /** Optional context for error logging */
  logContext?: Record<string, unknown>;
  /** Whether to automatically refetch when userId changes (default: true) */
  enabled?: boolean;
}

interface UseFirestoreQueryReturn<T> {
  /** The fetched data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** User-facing error message */
  error: string | null;
  /** Function to manually refetch data */
  refetch: () => Promise<void>;
  /** Function to set data directly (useful for optimistic updates) - supports functional updates */
  setData: Dispatch<SetStateAction<T | null>>;
}

/**
 * Generic hook for querying Firestore with consistent error handling and loading states.
 * Provides a clean abstraction over Firestore operations.
 * 
 * Benefits over useLoadData:
 * - More descriptive naming (queryFn vs loadFn)
 * - Supports optimistic updates via setData
 * - Optional enabled flag for conditional queries
 * - Better TypeScript inference
 * 
 * @example
 * const { data: recipes, loading, error, refetch } = useFirestoreQuery({
 *   queryFn: getUserRecipes,
 *   userId: user?.uid,
 *   errorMessage: "Failed to load recipes",
 * });
 */
export function useFirestoreQuery<T>({
  queryFn,
  userId,
  errorMessage,
  logContext = {},
  enabled = true,
}: UseFirestoreQueryOptions<T>): UseFirestoreQueryReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await queryFn(userId);
      setData(result);
    } catch (err) {
      logError(`Firestore query error: ${errorMessage}`, err, {
        userId,
        ...logContext,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    // Note: logContext is intentionally excluded from deps to avoid infinite loops
    // since it's typically an inline object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, errorMessage, enabled, queryFn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}
