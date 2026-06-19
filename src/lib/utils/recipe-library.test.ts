import { describe, expect, it } from "vitest";

import type { Recipe } from "@/lib/schemas/recipe";
import {
  filterRecipes,
  filterRecipesBySearch,
  getRecipeMetadataOptions,
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
    difficulty: "Easy",
    cuisine: "Italian",
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

describe("filterRecipes", () => {
  it("combines text, difficulty, and cuisine filters", () => {
    const recipes = [
      makeRecipe({
        id: "1",
        title: "Lemon Pasta",
        difficulty: "Easy",
        cuisine: "Italian",
      }),
      makeRecipe({
        id: "2",
        title: "Lemon Rice",
        difficulty: "Moderate",
        cuisine: "Japanese",
      }),
      makeRecipe({
        id: "3",
        title: "Tomato Pasta",
        difficulty: "Easy",
        cuisine: "Italian",
      }),
    ];

    expect(
      filterRecipes(recipes, {
        searchTerm: "lemon",
        difficulty: "Easy",
        cuisine: "Italian",
      })
    ).toEqual([recipes[0]]);
  });

  it("returns all recipes when filters are empty", () => {
    const recipes = [
      makeRecipe({ id: "1" }),
      makeRecipe({ id: "2" }),
    ];

    expect(filterRecipes(recipes, {})).toEqual(recipes);
  });
});

describe("getRecipeMetadataOptions", () => {
  it("returns sorted unique metadata values", () => {
    const recipes = [
      makeRecipe({ id: "1", cuisine: "Thai", difficulty: "Moderate" }),
      makeRecipe({ id: "2", cuisine: "Italian", difficulty: "Easy" }),
      makeRecipe({ id: "3", cuisine: "Thai", difficulty: "Easy" }),
    ];

    expect(getRecipeMetadataOptions(recipes, "cuisine")).toEqual([
      "Italian",
      "Thai",
    ]);
    expect(getRecipeMetadataOptions(recipes, "difficulty")).toEqual([
      "Easy",
      "Moderate",
    ]);
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
