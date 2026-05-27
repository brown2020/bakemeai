import { describe, expect, it } from "vitest";

import type { RecipeStructure } from "@/lib/schemas/recipe";
import {
  canScaleRecipeServings,
  formatScaledQuantity,
  parseLeadingQuantity,
  scaleQuantityInText,
  scaleAllQuantitiesInText,
  scaleRecipeServings,
} from "@/lib/utils/recipe-servings";

const baseRecipe: RecipeStructure = {
  title: "Test Soup",
  preparationTime: "10 mins",
  cookingTime: "20 mins",
  servings: 4,
  difficulty: "Easy",
  ingredients: ["2 cups broth", "1/2 tsp salt", "salt to taste"],
  instructions: ["Add 2 cups broth to the pot.", "Simmer for 10 minutes."],
  calories: 200,
};

describe("recipe-servings utilities", () => {
  it("parses common quantity formats", () => {
    expect(parseLeadingQuantity("2 cups flour")?.value).toBe(2);
    expect(parseLeadingQuantity("1/2 tsp salt")?.value).toBe(0.5);
    expect(parseLeadingQuantity("1 1/2 cups milk")?.value).toBe(1.5);
  });

  it("scales ingredient quantities", () => {
    expect(scaleQuantityInText("2 cups broth", 2)).toBe("4 cups broth");
    expect(scaleQuantityInText("1/2 tsp salt", 2)).toBe("1 tsp salt");
    expect(scaleQuantityInText("salt to taste", 2)).toBe("salt to taste");
  });

  it("formats scaled quantities readably", () => {
    expect(formatScaledQuantity(1.5)).toBe("1 1/2");
    expect(formatScaledQuantity(4)).toBe("4");
  });

  it("scales embedded quantities in instructions", () => {
    expect(
      scaleAllQuantitiesInText("Add 2 cups broth to the pot.", 2)
    ).toBe("Add 4 cups broth to the pot.");
  });

  it("scales recipe servings and updates metadata", () => {
    const scaled = scaleRecipeServings(baseRecipe, 8);

    expect(scaled.servings).toBe(8);
    expect(scaled.ingredients?.[0]).toBe("4 cups broth");
    expect(scaled.calories).toBe(400);
    expect(scaled.instructions?.[0]).toContain("adjusted to serve 8");
    expect(scaled.instructions?.[1]).toContain("4 cups broth");
  });

  it("returns original recipe when target equals current servings", () => {
    expect(scaleRecipeServings(baseRecipe, 4)).toBe(baseRecipe);
  });

  it("detects scalable recipes", () => {
    expect(canScaleRecipeServings(baseRecipe)).toBe(true);
    expect(canScaleRecipeServings({ ...baseRecipe, servings: undefined })).toBe(
      false
    );
  });
});
