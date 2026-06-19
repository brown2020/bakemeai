import { describe, expect, it } from "vitest";

import type { Recipe } from "@/lib/schemas/recipe";
import { getCompleteStructureFromSavedRecipe } from "@/lib/utils/saved-recipe";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-id",
    userId: "user-id",
    title: "Tomato Soup",
    content: "# Tomato Soup",
    createdAt: { seconds: 1, nanoseconds: 0 } as Recipe["createdAt"],
    preparationTime: "10 mins",
    cookingTime: "20 mins",
    servings: 4,
    difficulty: "Easy",
    ingredients: ["2 cups tomatoes"],
    instructions: ["Simmer tomatoes."],
    calories: 120,
    macros: {
      protein: "4g",
      carbs: "18g",
      fat: "3g",
    },
    ...overrides,
  };
}

describe("getCompleteStructureFromSavedRecipe", () => {
  it("returns complete structured data for modern saved recipes", () => {
    const structure = getCompleteStructureFromSavedRecipe(makeRecipe());

    expect(structure).toEqual({
      title: "Tomato Soup",
      preparationTime: "10 mins",
      cookingTime: "20 mins",
      servings: 4,
      difficulty: "Easy",
      ingredients: ["2 cups tomatoes"],
      instructions: ["Simmer tomatoes."],
      calories: 120,
      macros: {
        protein: "4g",
        carbs: "18g",
        fat: "3g",
      },
    });
  });

  it("returns null for legacy recipes without complete structured fields", () => {
    const structure = getCompleteStructureFromSavedRecipe(
      makeRecipe({ instructions: undefined })
    );

    expect(structure).toBeNull();
  });

  it("returns null when saved difficulty is outside the generation contract", () => {
    const structure = getCompleteStructureFromSavedRecipe(
      makeRecipe({ difficulty: "Medium" })
    );

    expect(structure).toBeNull();
  });
});
