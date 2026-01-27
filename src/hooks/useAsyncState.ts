import { useState, useCallback } from "react";

/**
 * Unified async state management result.
 * Provides consistent structure for loading, error, and data states.
 */
export interface AsyncState<T> {
  /** The data result (null until loaded) */
  data: T | null;
  /** Loading state indicator */
  loading: boolean;
  /** User-facing error message (null if no error) */
  error: string | null;
  /** Whether the operation was successful */
  success: boolean;
}

/**
 * Actions for managing async state.
 */
export interface AsyncActions<T> {
  /** Execute the async operation */
  execute: (...args: unknown[]) => Promise<T | null>;
  /** Reset the state to initial values */
  reset: () => void;
  /** Set data directly (useful for optimistic updates) */
  setData: (data: T | null) => void;
  /** Clear error state */
  clearError: () => void;
  /** Set success state */
  setSuccess: (success: boolean) => void;
}

/**
 * Hook for managing async operations with consistent loading/error/success states.
 * Eliminates boilerplate and provides unified pattern across the application.
 * 
 * Benefits:
 * - Consistent state management for all async operations
 * - Automatic loading and error handling
 * - Built-in success state for user feedback
 * - Optimistic update support
 * - Type-safe with generics
 * 
 * @param asyncFn - The async function to execute
 * @param onSuccess - Optional callback when operation succeeds
 * @param onError - Optional callback when operation fails
 * @returns State and actions for managing the async operation
 * 
 * @example
 * const { data, loading, error, execute, reset } = useAsyncState(
 *   async (id: string) => await fetchUser(id),
 *   (user) => console.log('User loaded:', user)
 * );
 * 
 * // Execute with parameters
 * await execute('user-123');
 * 
 * // Reset state
 * reset();
 */
export function useAsyncState<T>(
  asyncFn: (...args: unknown[]) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
): AsyncState<T> & AsyncActions<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const result = await asyncFn(...args);
        setData(result);
        setSuccess(true);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setSuccess(false);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    success,
    execute,
    reset,
    setData,
    clearError,
    setSuccess,
  };
}

/**
 * Hook for managing multiple async operations that should execute sequentially.
 * Useful for multi-step processes like form submission with multiple API calls.
 * 
 * @example
 * const pipeline = useAsyncPipeline([
 *   async () => await validateInput(),
 *   async () => await saveData(),
 *   async () => await sendNotification(),
 * ]);
 * 
 * await pipeline.execute();
 */
export function useAsyncPipeline(
  steps: Array<(...args: unknown[]) => Promise<unknown>>
): AsyncState<unknown[]> & AsyncActions<unknown[]> {
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (): Promise<unknown[] | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const results: unknown[] = [];

    try {
      for (const step of steps) {
        const result = await step();
        results.push(result);
      }
      setData(results);
      setSuccess(true);
      return results;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Pipeline failed";
      setError(errorMessage);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [steps]);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    data,
    loading,
    error,
    success,
    execute,
    reset,
    setData: (newData: unknown[] | null) => setData(newData || []),
    clearError: () => setError(null),
    setSuccess,
  };
}
