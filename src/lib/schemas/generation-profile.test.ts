import { describe, expect, it } from "vitest";

import { parseGenerationProfile } from "@/lib/schemas/generation-profile";

const validProfile = {
  id: "user-1",
  dietary: ["Vegan"],
  allergies: ["peanuts"],
  dislikedIngredients: ["cilantro"],
  preferredCuisines: ["Thai"],
  cookingExperience: "beginner",
  servingSize: 2,
};

describe("parseGenerationProfile", () => {
  it("accepts a normal profile and drops blank tags", () => {
    const parsed = parseGenerationProfile({
      ...validProfile,
      allergies: ["peanuts", "  "],
    });

    expect(parsed).toEqual({
      ok: true,
      profile: { ...validProfile, allergies: ["peanuts"] },
    });
  });

  it("allows generation with no saved profile", () => {
    expect(parseGenerationProfile(null)).toEqual({ ok: true, profile: null });
    expect(parseGenerationProfile(undefined)).toEqual({
      ok: true,
      profile: null,
    });
  });

  it("rejects oversized preference text before it can reach the model", () => {
    const parsed = parseGenerationProfile({
      ...validProfile,
      allergies: ["p".repeat(201)],
    });

    expect(parsed).toEqual({ ok: false });
  });

  it("rejects lists above the Firestore cap", () => {
    const parsed = parseGenerationProfile({
      ...validProfile,
      allergies: Array.from({ length: 51 }, (_, index) => `a${index}`),
    });

    expect(parsed).toEqual({ ok: false });
  });
});
