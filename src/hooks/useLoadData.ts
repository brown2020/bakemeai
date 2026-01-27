import { useState, useEffect } from "react";
import { logError } from "@/lib/utils/logger";

interface UseLoadDataOptions<T> {
  /** The async function to load data */
  loadFn: (userId: string) => Promise<T>;
  /** User ID to pass to loadFn */
  userId?: string;
  /** Error message to show users */
  errorMessage: string;
  /** Context object for error logging */
  logContext?: Record<string, unknown>;
}

interface UseLoadDataReturn<T> {
  /** The loaded data */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error message for display */
  error: string | null;
  /** Function to retry loading */
  reload: () => Promise<void>;
}

/**
 * Reusable hook for loading user-specific data from Firestore.
 * Handles loading state, error handling, and logging consistently.
 * 
 * @example
 * const { data: recipes, loading, error } = useLoadData({
 *   loadFn: getUserRecipes,
 *   userId: user?.uid,
 *   errorMessage: "Failed to load recipes",
 * });
 */
export function useLoadData<T>({
  loadFn,
  userId,
  errorMessage,
  logContext = {},
}: UseLoadDataOptions<T>): UseLoadDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await loadFn(userId);
      setData(result);
    } catch (err) {
      logError(`Error in useLoadData: ${errorMessage}`, err, {
        userId,
        ...logContext,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { data, loading, error, reload: load };
}
