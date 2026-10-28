import { describe, expect, it } from "vitest";

import { planGenerationCancel } from "@/lib/utils/generation-cancel";

describe("planGenerationCancel", () => {
  it("stops the in-flight request and does not keep it as a finished recipe", () => {
    expect(planGenerationCancel()).toEqual({
      clearPendingStart: true,
      abortInFlight: true,
      stopGenerating: true,
      recordHistory: false,
    });
  });
});