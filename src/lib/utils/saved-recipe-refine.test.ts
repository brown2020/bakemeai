import { describe, expect, it } from "vitest";

import { FORM_VALIDATION } from "@/lib/constants/ui";
import type { Recipe } from "@/lib/schemas/recipe";
import { buildSavedRecipeRefinePrompt } from "@/lib/utils/saved-recipe-refine";

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-id",
    userId: "user-id",
    title: "Lemon Pasta",
    content: "# Lemon Pasta",
    createdAt: { seconds: 1, nanoseconds: 0 } as Recipe["createdAt"],
    ingredients: ["pasta", "lemon", "parmesan"],
    servings: 2,
    difficulty: "Easy",
    cuisine: "Italian",
    ...overrides,
  };
}

describe("buildSavedRecipeRefinePrompt", () => {
  it("builds an editable prompt from saved recipe metadata", () => {
    const prompt = buildSavedRecipeRefinePrompt(makeRecipe());

    expect(prompt).toContain('Create a fresh variation of "Lemon Pasta".');
    expect(prompt).toContain("Reference ingredients: pasta, lemon, parmesan.");
    expect(prompt).toContain("Original details: 2 servings, Easy, Italian.");
  });

  it("limits prompts to the recipe input max length", () => {
    const prompt = buildSavedRecipeRefinePrompt(
      makeRecipe({
        title: "A".repeat(600),
        ingredients: Array.from({ length: 20 }, (_, index) =>
          `ingredient-${index}`
        ),
      })
    );

    expect(prompt.length).toBeLessThanOrEqual(FORM_VALIDATION.INPUT_MAX_LENGTH);
    expect(prompt.endsWith("...")).toBe(true);
  });
});
