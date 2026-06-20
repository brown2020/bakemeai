import { describe, expect, it } from "vitest";

import {
  completeRecipeStructureSchema,
  recipeStructureSchema,
  recipeSchema,
} from "@/lib/schemas/recipe";
import type { Recipe } from "@/lib/schemas/recipe";

const createdAt = {
  seconds: 1,
  nanoseconds: 0,
} as Recipe["createdAt"];

describe("recipeSchema", () => {
  it("accepts saved recipes with structured instructions and tips", () => {
    const result = recipeSchema.safeParse({
      id: "recipe-id",
      userId: "user-id",
      title: "Vegetable Soup",
      content: "# Vegetable Soup",
      createdAt,
      ingredients: ["2 cups broth"],
      instructions: ["Warm the broth."],
      tips: ["Use low-sodium broth."],
      preparationTime: "10 mins",
      cookingTime: "20 mins",
      servings: 4,
      difficulty: "Easy",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.instructions).toEqual(["Warm the broth."]);
    expect(result.data.tips).toEqual(["Use low-sodium broth."]);
  });

  it("stays backward-compatible with older saved recipes", () => {
    const result = recipeSchema.safeParse({
      id: "recipe-id",
      userId: "user-id",
      title: "Legacy Soup",
      content: "# Legacy Soup",
      createdAt,
      ingredients: ["broth"],
    });

    expect(result.success).toBe(true);
  });
});

describe("completeRecipeStructureSchema", () => {
  it("requires instructions before generated recipes can be saved", () => {
    const result = completeRecipeStructureSchema.safeParse({
      title: "Vegetable Soup",
      preparationTime: "10 mins",
      cookingTime: "20 mins",
      servings: 4,
      difficulty: "Easy",
      ingredients: ["2 cups broth"],
    });

    expect(result.success).toBe(false);
  });

  it("keeps final recipe difficulty validation strict", () => {
    const result = completeRecipeStructureSchema.safeParse({
      title: "Vegetable Soup",
      preparationTime: "10 mins",
      cookingTime: "20 mins",
      servings: 4,
      difficulty: "Intermediate",
      ingredients: ["2 cups broth"],
      instructions: ["Warm the broth."],
    });

    expect(result.success).toBe(false);
  });
});

describe("recipeStructureSchema", () => {
  it("tolerates transient invalid difficulty strings while streaming", () => {
    const result = recipeStructureSchema.safeParse({
      title: "Chocolate Chip Cookies",
      difficulty: "Inter",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual({
      title: "Chocolate Chip Cookies",
      difficulty: undefined,
    });
  });

  it("keeps valid streamed difficulty values", () => {
    const result = recipeStructureSchema.safeParse({
      title: "Chocolate Chip Cookies",
      difficulty: "Easy",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.difficulty).toBe("Easy");
  });
});
