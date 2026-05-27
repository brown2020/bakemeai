import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  dismissProfileOnboarding,
  getOnboardingDismissedKey,
  getProfileWelcomePath,
  isOnboardingDismissed,
  isProfileWelcomeSearchParam,
} from "@/lib/utils/onboarding";

describe("onboarding utilities", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    });
  });

  it("builds a per-user storage key", () => {
    expect(getOnboardingDismissedKey("uid-123")).toBe(
      "bakemeai_onboarding_dismissed_uid-123"
    );
  });

  it("tracks dismissal per user", () => {
    expect(isOnboardingDismissed("user-a")).toBe(false);
    dismissProfileOnboarding("user-a");
    expect(isOnboardingDismissed("user-a")).toBe(true);
    expect(isOnboardingDismissed("user-b")).toBe(false);
  });

  it("builds profile welcome path", () => {
    expect(getProfileWelcomePath()).toBe("/profile?welcome=1");
  });

  it("detects welcome query param", () => {
    expect(isProfileWelcomeSearchParam("1")).toBe(true);
    expect(isProfileWelcomeSearchParam("0")).toBe(false);
    expect(isProfileWelcomeSearchParam(null)).toBe(false);
  });
});
