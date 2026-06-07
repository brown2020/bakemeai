import { describe, expect, it } from "vitest";

import {
  AppError,
  ERROR_MESSAGES,
  convertErrorToMessage,
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
