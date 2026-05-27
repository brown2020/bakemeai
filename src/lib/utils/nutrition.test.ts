import { describe, expect, it } from "vitest";

import {
  extractNutritionSummary,
  hasNutritionSummary,
} from "@/lib/utils/nutrition";

describe("nutrition utilities", () => {
  it("returns null when all nutrition fields are empty", () => {
    expect(extractNutritionSummary({ calories: null, macros: null })).toBeNull();
    expect(extractNutritionSummary({})).toBeNull();
  });

  it("extracts calories and macros when present", () => {
    const summary = extractNutritionSummary({
      calories: 420,
      macros: {
        protein: "25g",
        carbs: "40g",
        fat: "12g",
      },
    });

    expect(summary).toEqual({
      calories: 420,
      protein: "25g",
      carbs: "40g",
      fat: "12g",
    });
  });

  it("supports partial nutrition data", () => {
    const summary = extractNutritionSummary({ calories: 300, macros: null });
    expect(summary).not.toBeNull();
    expect(hasNutritionSummary(summary!)).toBe(true);
  });

  it("ignores blank macro strings", () => {
    expect(
      extractNutritionSummary({
        calories: null,
        macros: { protein: "  ", carbs: null, fat: null },
      })
    ).toBeNull();
  });
});
