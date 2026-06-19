import { describe, expect, it } from "vitest";

import type { Recipe } from "@/lib/schemas/recipe";
import {
  filterRecipesBySearch,
  sortRecipesByCreatedAtDesc,
} from "@/lib/utils/recipe-library";

function makeRecipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: "recipe-id",
    userId: "user-id",
    title: "Pasta",
    content: "# Pasta",
    createdAt: { seconds: 1, nanoseconds: 0 } as Recipe["createdAt"],
    ingredients: ["noodles"],
    ...overrides,
  };
}

describe("filterRecipesBySearch", () => {
  it("returns an empty list when recipes are not loaded", () => {
    expect(filterRecipesBySearch(null, "pasta")).toEqual([]);
    expect(filterRecipesBySearch(undefined, "pasta")).toEqual([]);
  });

  it("matches recipe titles case-insensitively", () => {
    const recipes = [
      makeRecipe({ id: "1", title: "Lemon Pasta" }),
      makeRecipe({ id: "2", title: "Rice Bowl" }),
    ];

    expect(filterRecipesBySearch(recipes, "PASTA")).toEqual([recipes[0]]);
  });

  it("matches ingredient text case-insensitively", () => {
    const recipes = [
      makeRecipe({ id: "1", ingredients: ["eggs", "spinach"] }),
      makeRecipe({ id: "2", ingredients: ["rice"] }),
    ];

    expect(filterRecipesBySearch(recipes, "SPIN")).toEqual([recipes[0]]);
  });

  it("returns all recipes for an empty search term", () => {
    const recipes = [
      makeRecipe({ id: "1" }),
      makeRecipe({ id: "2" }),
    ];

    expect(filterRecipesBySearch(recipes, "")).toEqual(recipes);
  });
});

describe("sortRecipesByCreatedAtDesc", () => {
  it("returns newest recipes first without mutating the input", () => {
    const older = makeRecipe({
      id: "older",
      createdAt: { seconds: 10, nanoseconds: 0 } as Recipe["createdAt"],
    });
    const newer = makeRecipe({
      id: "newer",
      createdAt: { seconds: 20, nanoseconds: 0 } as Recipe["createdAt"],
    });
    const recipes = [older, newer];

    expect(sortRecipesByCreatedAtDesc(recipes)).toEqual([newer, older]);
    expect(recipes).toEqual([older, newer]);
  });
});
