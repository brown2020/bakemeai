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

  it("ignores cancel ids that are not generation ids", async () => {
    await expect(cancelRecipeGeneration("nope")).resolves.toBeUndefined();
  });
});
