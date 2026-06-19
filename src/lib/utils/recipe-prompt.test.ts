import { describe, expect, it } from "vitest";

import {
  appendTweakToPrompt,
  buildRecipePrompt,
  canSubmitRecipeGeneration,
  getRecipeInputForMode,
  validateRecipeInput,
  validateTweak,
} from "@/lib/utils/recipe-prompt";
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

  it("selects input text based on generation mode", () => {
    expect(getRecipeInputForMode("ramen", "eggs, rice", "specific")).toBe(
      "ramen"
    );
    expect(getRecipeInputForMode("ramen", "eggs, rice", "ingredients")).toBe(
      "eggs, rice"
    );
  });

  it("validates mode-specific recipe input", () => {
    expect(validateRecipeInput("pie", "specific")).toBeNull();
    expect(validateRecipeInput("egg", "ingredients")).toBeNull();
    expect(validateRecipeInput("  ", "specific")).not.toBeNull();
    expect(validateRecipeInput("  ", "ingredients")).not.toBeNull();
  });

  it("builds mode-specific recipe prompts", () => {
    expect(buildRecipePrompt("ramen", "specific")).toContain(
      "detailed recipe for: ramen"
    );
    expect(buildRecipePrompt("eggs, rice", "ingredients")).toContain(
      "I have these ingredients: eggs, rice"
    );
  });

  it("checks generation submit debounce windows", () => {
    expect(canSubmitRecipeGeneration(1_000, 500, 1_499)).toBe(false);
    expect(canSubmitRecipeGeneration(1_000, 500, 1_500)).toBe(true);
  });
});
