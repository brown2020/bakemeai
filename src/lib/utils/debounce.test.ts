import { afterEach, describe, expect, it, vi } from "vitest";

import { createDebouncedCall } from "@/lib/utils/debounce";

describe("createDebouncedCall", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs the latest call after the delay", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = createDebouncedCall(callback, 500);

    debounced("first");
    debounced("second");
    vi.advanceTimersByTime(499);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("second");
  });

  it("drops a pending call when cancelled", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = createDebouncedCall(callback, 500);

    debounced("pasta");
    debounced.cancel();
    vi.advanceTimersByTime(500);

    expect(callback).not.toHaveBeenCalled();
  });
});
