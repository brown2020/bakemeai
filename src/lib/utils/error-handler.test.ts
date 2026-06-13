import { describe, expect, it } from "vitest";

import {
  AppError,
  ERROR_MESSAGES,
  convertRecipeGenerationErrorToMessage,
  convertErrorToMessage,
  isKnownFirebaseAuthError,
  isAppError,
} from "@/lib/utils/error-handler";

const FALLBACK = "Fallback message";

describe("isAppError", () => {
  it("identifies AppError instances", () => {
    expect(isAppError(new AppError("boom", "CODE"))).toBe(true);
  });

  it("rejects plain errors and non-errors", () => {
    expect(isAppError(new Error("boom"))).toBe(false);
    expect(isAppError("boom")).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});

describe("convertErrorToMessage", () => {
  it("maps known Firebase auth error codes to friendly messages", () => {
    expect(
      convertErrorToMessage({ code: "auth/invalid-credential" }, FALLBACK)
    ).toBe(ERROR_MESSAGES.AUTH.INVALID_CREDENTIAL);
    expect(
      convertErrorToMessage({ code: "auth/too-many-requests" }, FALLBACK)
    ).toBe(ERROR_MESSAGES.AUTH.TOO_MANY_REQUESTS);
  });

  it("falls back for unknown Firebase error codes", () => {
    expect(convertErrorToMessage({ code: "auth/unknown" }, FALLBACK)).toBe(
      FALLBACK
    );
  });

  it("surfaces AppError messages (user-facing by contract)", () => {
    expect(
      convertErrorToMessage(new AppError("Recipe is incomplete", "X"), FALLBACK)
    ).toBe("Recipe is incomplete");
  });

  it("hides raw (non-AppError) Error messages behind the fallback", () => {
    expect(convertErrorToMessage(new Error("stack trace leak"), FALLBACK)).toBe(
      FALLBACK
    );
  });

  it("falls back for plain objects and primitives without a code", () => {
    expect(convertErrorToMessage({ message: "nope" }, FALLBACK)).toBe(FALLBACK);
    expect(convertErrorToMessage("string error", FALLBACK)).toBe(FALLBACK);
    expect(convertErrorToMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });
});

describe("isKnownFirebaseAuthError", () => {
  it("identifies mapped Firebase auth errors", () => {
    expect(isKnownFirebaseAuthError({ code: "auth/invalid-credential" })).toBe(
      true
    );
  });

  it("rejects unknown error codes", () => {
    expect(isKnownFirebaseAuthError({ code: "auth/something-new" })).toBe(
      false
    );
    expect(isKnownFirebaseAuthError(new Error("boom"))).toBe(false);
  });
});

describe("convertRecipeGenerationErrorToMessage", () => {
  it("hides provider API key details", () => {
    expect(
      convertRecipeGenerationErrorToMessage(
        new Error("Incorrect API key provided")
      )
    ).toBe(ERROR_MESSAGES.RECIPE.GENERATION_UNAVAILABLE);
  });

  it("maps provider auth and quota status codes", () => {
    expect(convertRecipeGenerationErrorToMessage({ status: 401 })).toBe(
      ERROR_MESSAGES.RECIPE.GENERATION_UNAVAILABLE
    );
    expect(convertRecipeGenerationErrorToMessage({ status: 429 })).toBe(
      ERROR_MESSAGES.RECIPE.GENERATION_UNAVAILABLE
    );
  });

  it("falls back for unknown generation errors", () => {
    expect(convertRecipeGenerationErrorToMessage(new Error("random"))).toBe(
      ERROR_MESSAGES.RECIPE.GENERATION_FAILED
    );
  });
});
