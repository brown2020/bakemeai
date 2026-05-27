/**
 * Client-side helpers for profile onboarding dismissal state.
 * Persists per-user skip choice in localStorage.
 */

import {
  ONBOARDING_DISMISSED_KEY_PREFIX,
  PROFILE_WELCOME_QUERY,
  PROFILE_WELCOME_VALUE,
} from "@/lib/constants/onboarding";

export function getOnboardingDismissedKey(userId: string): string {
  return `${ONBOARDING_DISMISSED_KEY_PREFIX}${userId}`;
}

function getLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function isOnboardingDismissed(userId: string): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    return storage.getItem(getOnboardingDismissedKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function dismissProfileOnboarding(userId: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(getOnboardingDismissedKey(userId), "1");
  } catch {
    // Ignore quota or privacy mode errors — banner may reappear next visit
  }
}

export function getProfileWelcomePath(): string {
  return `/profile?${PROFILE_WELCOME_QUERY}=${PROFILE_WELCOME_VALUE}`;
}

export function isProfileWelcomeSearchParam(
  value: string | null | undefined
): boolean {
  return value === PROFILE_WELCOME_VALUE;
}
