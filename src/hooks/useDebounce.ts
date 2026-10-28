"use client";

import { useEffect, useMemo, useRef } from "react";

import { createDebouncedCall, type DebouncedCall } from "@/lib/utils/debounce";
import { logError } from "@/lib/utils/logger";

/**
 * Hook for debouncing function calls to prevent excessive API requests.
 * Call `cancel()` to drop a pending invocation.
 */
export function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): DebouncedCall<T> {
  const callbackRef = useRef(callback);
  const delayRef = useRef(delay);
  const runnerRef = useRef<DebouncedCall<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    delayRef.current = delay;
    runnerRef.current?.cancel();
    runnerRef.current = null;
    return () => {
      runnerRef.current?.cancel();
    };
  }, [delay]);

  return useMemo(() => {
    const run = ((...args: Parameters<T>) => {
      if (!runnerRef.current) {
        runnerRef.current = createDebouncedCall(((...inner: Parameters<T>) => {
          try {
            callbackRef.current(...inner);
          } catch (error) {
            logError("Debounced callback error", error, {});
          }
        }) as T, delayRef.current);
      }
      runnerRef.current(...args);
    }) as DebouncedCall<T>;

    run.cancel = () => {
      runnerRef.current?.cancel();
    };

    return run;
  }, []);
}
