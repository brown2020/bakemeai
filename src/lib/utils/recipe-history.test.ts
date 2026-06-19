import { describe, expect, it } from "vitest";

import type { RecipeStructure } from "@/lib/schemas/recipe";
import { addRecipeToGenerationHistory } from "@/lib/utils/recipe-history";

function makeRecipe(title: string): RecipeStructure {
  return {
    title,
    preparationTime: "10 mins",
    cookingTime: "20 mins",
    servings: 2,
    difficulty: "Easy",
    ingredients: [`1 cup ${title}`],
    instructions: [`Cook ${title}.`],
  };
}

describe("addRecipeToGenerationHistory", () => {
  it("adds recipes newest first without mutating the input", () => {
    const first = makeRecipe("Pasta");
    const history = [first];
    const next = makeRecipe("Soup");

    expect(addRecipeToGenerationHistory(history, next)).toEqual([next, first]);
    expect(history).toEqual([first]);
  });

  it("caps history at the requested limit", () => {
    const recipes = ["1", "2", "3", "4", "5"].map(makeRecipe);
    const next = makeRecipe("6");

    expect(addRecipeToGenerationHistory(recipes, next, 5)).toEqual([
      next,
      recipes[0],
      recipes[1],
      recipes[2],
      recipes[3],
    ]);
  });

  it("moves duplicate snapshots to the front", () => {
    const first = makeRecipe("Pasta");
    const second = makeRecipe("Soup");

    expect(addRecipeToGenerationHistory([second, first], first)).toEqual([
      first,
      second,
    ]);
  });
});
