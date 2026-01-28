import { useState, useEffect, useCallback, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
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
 * Handles unstable queryFn and logContext references automatically using refs
 * to prevent infinite re-fetching loops.
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

  // Use refs to avoid infinite loops from unstable function/object references
  const queryFnRef = useRef(queryFn);
  const logContextRef = useRef(logContext);

  // Update refs when values change
  useEffect(() => {
    queryFnRef.current = queryFn;
    logContextRef.current = logContext;
  }, [queryFn, logContext]);

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
        ...logContextRef.current,
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
