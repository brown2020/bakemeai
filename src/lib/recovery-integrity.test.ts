import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("ai", () => ({
  streamObject: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => "mock-model"),
}));

vi.mock("@ai-sdk/rsc", () => ({
  createStreamableValue: vi.fn(() => ({
    value: "stream-value",
    update: vi.fn(),
    done: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock("@/lib/utils/server-auth", () => ({
  requireAuthenticatedUserId: vi.fn(async () => "user-recovery-1"),
}));

vi.mock("@/lib/db", () => ({
  saveRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
  getUserRecipes: vi.fn(),
}));

import { streamObject } from "ai";
import { saveRecipe as saveRecipeToDb } from "@/lib/db";
import { generateRecipe } from "./recipe-generation.server";
import { saveRecipeToDatabase } from "./services/recipe-service";
import { AppError } from "./utils/error-handler";

const completeRecipe = {
  title: "Recovery Toast",
  preparationTime: "5 mins",
  cookingTime: "5 mins",
  servings: 1,
  difficulty: "Easy" as const,
  ingredients: ["1 slice bread", "1 tsp butter"],
  instructions: ["Toast bread", "Spread butter"],
  tips: ["Eat warm"],
  calories: 120,
  macros: { protein: "3g", carbs: "15g", fat: "5g" },
};

describe("recovery integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key-not-real";
  });

  it("fails OpenAI/provider start without claiming success (interrupted generate)", async () => {
    vi.mocked(streamObject).mockImplementation(() => {
      throw new Error("OpenAI 500 upstream failure");
    });

    await expect(generateRecipe("scrambled eggs recovery fail", false)).rejects.toMatchObject({
      code: "RECIPE_PROVIDER_ERROR",
    });

    expect(saveRecipeToDb).not.toHaveBeenCalled();
  });

  it("fails Firestore save and surfaces RECIPE_SAVE_FAILED (no silent success)", async () => {
    vi.mocked(saveRecipeToDb).mockRejectedValue(new Error("Firestore unavailable"));

    await expect(saveRecipeToDatabase("user-recovery-1", completeRecipe)).rejects.toBeInstanceOf(
      AppError
    );
    await expect(saveRecipeToDatabase("user-recovery-1", completeRecipe)).rejects.toMatchObject({
      code: "RECIPE_SAVE_FAILED",
    });
    expect(saveRecipeToDb).toHaveBeenCalled();
  });

  it("concurrent saves preserve user ownership; contention does not invent success", async () => {
    let calls = 0;
    vi.mocked(saveRecipeToDb).mockImplementation(async (args) => {
      calls += 1;
      expect(args.userId).toBe("user-recovery-1");
      if (calls === 1) {
        await new Promise((r) => setTimeout(r, 30));
        return {
          id: "doc-a",
          userId: args.userId,
          title: args.structuredData.title,
        } as never;
      }
      throw new Error("Contention / unavailable on second write");
    });

    const results = await Promise.allSettled([
      saveRecipeToDatabase("user-recovery-1", { ...completeRecipe, title: "Concurrent A" }),
      saveRecipeToDatabase("user-recovery-1", { ...completeRecipe, title: "Concurrent B" }),
    ]);

    const rejected = results.filter((r) => r.status === "rejected");
    expect(results).toHaveLength(2);
    expect(rejected.length).toBeGreaterThanOrEqual(1);
    expect(saveRecipeToDb).toHaveBeenCalledTimes(2);
  });

  it("rejects incomplete recipe before write (validation gate / interrupted payload)", async () => {
    await expect(
      saveRecipeToDatabase("user-recovery-1", { title: "Incomplete" } as never)
    ).rejects.toMatchObject({
      code: "RECIPE_VALIDATION_FAILED",
    });
    expect(saveRecipeToDb).not.toHaveBeenCalled();
  });
});
