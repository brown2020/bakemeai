import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireGenerationUser, applyGenerationQuota, streamObject } = vi.hoisted(
  () => ({
    requireGenerationUser: vi.fn(),
    applyGenerationQuota: vi.fn(),
    streamObject: vi.fn(),
  })
);

vi.mock("@/lib/utils/server-auth", () => ({
  requireAuthenticatedUserId: vi.fn(async () => "user-1"),
  requireGenerationUser,
}));

vi.mock("@/lib/utils/generation-quota", () => ({
  applyGenerationQuota,
}));

vi.mock("ai", () => ({
  streamObject,
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

import { openai } from "@ai-sdk/openai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { AppError, ERROR_MESSAGES } from "@/lib/utils/error-handler";
import {
  cancelRecipeGeneration,
  generateRecipe,
} from "./recipe-generation.server";

const verifiedUser = {
  uid: "user-1",
  emailVerified: true,
  idToken: "token",
};

describe("generateRecipe guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-key-not-real";
    requireGenerationUser.mockResolvedValue(verifiedUser);
    applyGenerationQuota.mockResolvedValue({
      allowed: true,
      resetAt: 0,
      source: "memory",
    });
  });

  it("returns unverified-email failures without calling the model", async () => {
    requireGenerationUser.mockRejectedValue(
      new AppError(
        ERROR_MESSAGES.AUTH.EMAIL_NOT_VERIFIED,
        "EMAIL_NOT_VERIFIED"
      )
    );

    await expect(generateRecipe("weeknight pasta", false)).resolves.toMatchObject(
      {
        ok: false,
        code: "EMAIL_NOT_VERIFIED",
        message: ERROR_MESSAGES.AUTH.EMAIL_NOT_VERIFIED,
      }
    );
    expect(streamObject).not.toHaveBeenCalled();
    expect(applyGenerationQuota).not.toHaveBeenCalled();
  });

  it("returns the quota denial without calling the model", async () => {
    applyGenerationQuota.mockResolvedValue({
      allowed: false,
      resetAt: 1,
      source: "firestore",
    });

    await expect(generateRecipe("weeknight pasta", false)).resolves.toMatchObject(
      { ok: false, code: "RATE_LIMITED" }
    );
    expect(streamObject).not.toHaveBeenCalled();
  });

  it("rejects an oversized profile before the model or quota write", async () => {
    const profile = {
      dietary: [],
      allergies: ["x".repeat(201)],
      dislikedIngredients: [],
      preferredCuisines: [],
      cookingExperience: "beginner",
      servingSize: 2,
    };

    await expect(
      generateRecipe("weeknight pasta", false, profile)
    ).resolves.toMatchObject({
      ok: false,
      code: "INVALID_PROFILE",
      message: ERROR_MESSAGES.RECIPE.INVALID_PREFERENCES,
    });
    expect(streamObject).not.toHaveBeenCalled();
    expect(applyGenerationQuota).not.toHaveBeenCalled();
  });

  it("returns a provider failure when the model call throws", async () => {
    streamObject.mockImplementation(() => {
      throw new Error("OpenAI 500 upstream failure");
    });

    await expect(generateRecipe("weeknight pasta", false)).resolves.toMatchObject(
      { ok: false, code: "RECIPE_PROVIDER_ERROR" }
    );
  });

  it("streams a recipe for a verified user on gpt-4o", async () => {
    const updates: unknown[] = [];
    const done = vi.fn();
    vi.mocked(createStreamableValue).mockReturnValue({
      value: "stream-value",
      update: (value: unknown) => {
        updates.push(value);
      },
      done,
      error: vi.fn(),
    } as never);

    async function* partials() {
      yield { title: "Weeknight Pasta" };
      yield {
        title: "Weeknight Pasta",
        ingredients: ["200g pasta"],
        instructions: ["Boil, then toss"],
      };
    }

    streamObject.mockReturnValue({
      partialObjectStream: partials(),
    });

    const result = await generateRecipe("  weeknight pasta  ", false);

    expect(result).toMatchObject({ ok: true, stream: "stream-value" });
    if (!result.ok) return;
    expect(result.generationId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(openai).toHaveBeenCalledWith("gpt-4o");
    expect(streamObject).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
        prompt: "weeknight pasta",
        temperature: 0,
      })
    );

    await vi.waitFor(() => {
      expect(done).toHaveBeenCalledOnce();
    });
    expect(updates).toEqual([
      { kind: "recipe", recipe: { title: "Weeknight Pasta" } },
      {
        kind: "recipe",
        recipe: {
          title: "Weeknight Pasta",
          ingredients: ["200g pasta"],
          instructions: ["Boil, then toss"],
        },
      },
    ]);
  });

  it("ignores cancel ids that are not generation ids", async () => {
    await expect(cancelRecipeGeneration("nope")).resolves.toBeUndefined();
  });
});
