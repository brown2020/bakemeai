import { describe, expect, it } from "vitest";

import { abortGeneration, startGeneration } from "@/lib/utils/generation-abort";

describe("generation abort registry", () => {
  it("aborts only the owning user's generation", () => {
    const started = startGeneration("user-a");

    expect(abortGeneration(started.id, "user-b")).toBe(false);
    expect(started.controller.signal.aborted).toBe(false);

    expect(abortGeneration(started.id, "user-a")).toBe(true);
    expect(started.controller.signal.aborted).toBe(true);
    expect(abortGeneration(started.id, "user-a")).toBe(false);
  });
});
