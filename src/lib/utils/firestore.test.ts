import { describe, expect, it } from "vitest";

import { getFirestoreErrorMessage } from "@/lib/utils/firestore";

const FALLBACK = "Something went wrong";

describe("getFirestoreErrorMessage", () => {
  it("maps known Firestore error codes to friendly messages", () => {
    expect(
      getFirestoreErrorMessage({ code: "permission-denied" }, FALLBACK)
    ).toContain("permission");
    expect(
      getFirestoreErrorMessage({ code: "unavailable" }, FALLBACK)
    ).toContain("connect");
  });

  it("falls back for unknown error codes", () => {
    expect(getFirestoreErrorMessage({ code: "weird-code" }, FALLBACK)).toBe(
      FALLBACK
    );
  });

  it("falls back when the error has no code or is not an object", () => {
    expect(getFirestoreErrorMessage(new Error("no code"), FALLBACK)).toBe(
      FALLBACK
    );
    expect(getFirestoreErrorMessage("string", FALLBACK)).toBe(FALLBACK);
    expect(getFirestoreErrorMessage(null, FALLBACK)).toBe(FALLBACK);
  });
});
