import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from "react";
import { logError } from "@/lib/utils/logger";

interface UseFirestoreQueryOptions<T> {
  /** The async function to fetch data from Firestore */
  queryFn: (userId: string) => Promise<T>;
  /** User ID to pass to queryFn */
  userId?: string;
  /** User-facing error message to display on failure */
  errorMessage: string;
  /** Optional context for error logging (not reactive - changes won't trigger refetch) */
  logContext?: Record<string, unknown>;
  /** Whether to automatically refetch when userId changes (default: true) */
  enabled?: boolean;
}

interface UseFirestoreQueryReturn<T> {
  /** The fetched data */
  data: T | null;
  /** Loading state */
  isLoading: boolean;
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
 * const { data: recipes, isLoading, error, refetch } = useFirestoreQuery({
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to avoid infinite loop when queryFn is not memoized by caller
  const queryFnRef = useRef(queryFn);
  
  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  const fetchData = useCallback(async () => {
    if (!userId || !enabled) {
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await queryFnRef.current(userId);
      setData(result);
    } catch (err) {
      logError(`Firestore query error: ${errorMessage}`, err, {
        userId,
        ...logContext,
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId, errorMessage, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData,
  };
}
