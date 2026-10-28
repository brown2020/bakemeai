export interface DebouncedCall<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

/**
 * Delays `callback` until `delay` ms after the last call.
 * `cancel` drops a pending call so it never runs.
 */
export function createDebouncedCall<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
  timers: {
    schedule?: typeof setTimeout;
    clear?: typeof clearTimeout;
  } = {}
): DebouncedCall<T> {
  const schedule = timers.schedule ?? setTimeout;
  const clear = timers.clear ?? clearTimeout;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const run = ((...args: Parameters<T>) => {
    if (timer !== null) clear(timer);
    timer = schedule(() => {
      timer = null;
      callback(...args);
    }, delay);
  }) as DebouncedCall<T>;

  run.cancel = () => {
    if (timer === null) return;
    clear(timer);
    timer = null;
  };

  return run;
}
