import { describe, expect, it } from "vitest";

import { appendTweakToPrompt, validateTweak } from "@/lib/utils/recipe-prompt";
import { FORM_VALIDATION } from "@/lib/constants/ui";

describe("recipe-prompt utilities", () => {
  it("returns base prompt when tweak is empty", () => {
    const base = "Base prompt";
    expect(appendTweakToPrompt(base, "")).toBe(base);
    expect(appendTweakToPrompt(base, "   ")).toBe(base);
  });

  it("appends non-empty tweak text", () => {
    const result = appendTweakToPrompt("Base prompt", "make it spicier");
    expect(result).toContain("Base prompt");
    expect(result).toContain("make it spicier");
  });

  it("allows empty tweak validation", () => {
    expect(validateTweak("")).toBeNull();
    expect(validateTweak("  ")).toBeNull();
  });

  it("rejects tweak text over max length", () => {
    const longTweak = "a".repeat(FORM_VALIDATION.INPUT_MAX_LENGTH + 1);
    expect(validateTweak(longTweak)).not.toBeNull();
  });
});
