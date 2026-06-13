import { describe, expect, it } from "vitest";

import {
  extractNutritionFromMarkdown,
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

  it("extracts nutrition from legacy markdown content", () => {
    expect(
      extractNutritionFromMarkdown(`
        ## Nutrition
        - Calories: 1,240 kcal
        - Protein: 42g
        - Carbs: 120g
        - Fat: 35g
      `)
    ).toEqual({
      calories: 1240,
      protein: "42g",
      carbs: "120g",
      fat: "35g",
    });
  });

  it("uses markdown nutrition when structured fields are missing", () => {
    expect(
      extractNutritionSummary({
        content: `
          # Soup
          **Calories per serving:** about 320 kcal
          **Protein:** 18 g
          **Carbohydrates:** 31 g
          **Total Fat:** 9 g
        `,
      })
    ).toEqual({
      calories: 320,
      protein: "18 g",
      carbs: "31 g",
      fat: "9 g",
    });
  });

  it("keeps structured nutrition ahead of markdown fallback", () => {
    expect(
      extractNutritionSummary({
        calories: 450,
        macros: { protein: "30g", carbs: null, fat: null },
        content: `
          - Calories: 300 kcal
          - Protein: 10g
          - Carbs: 22g
        `,
      })
    ).toEqual({
      calories: 450,
      protein: "30g",
      carbs: "22g",
      fat: null,
    });
  });

  it("returns null for markdown without parseable nutrition", () => {
    expect(
      extractNutritionFromMarkdown("Cook until the fat renders, about 5 minutes.")
    ).toBeNull();
  });
});
