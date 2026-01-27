import { useEffect, useRef, useCallback } from "react";

/**
 * Hook for debouncing function calls to prevent excessive API requests.
 * Useful for rate-limiting expensive operations like AI generation.
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds before executing the callback
 * @returns Debounced function that can be called multiple times but only executes after delay
 * 
 * @example
 * const debouncedGenerate = useDebounce(() => generateRecipe(), 1000);
 * // Multiple rapid calls will only execute once after 1 second
 * debouncedGenerate();
 * debouncedGenerate(); // Cancels previous call
 * debouncedGenerate(); // Only this one will execute
 */
export function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/** Minimum delay between AI generation requests (balances responsiveness with rate limits) */
export const AI_GENERATION_DEBOUNCE_MS = 500;
