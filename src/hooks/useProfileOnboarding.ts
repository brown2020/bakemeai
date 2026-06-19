"use client";

import { useCallback, useState } from "react";

import type { SerializableUserProfile } from "@/lib/schemas/user";
import {
  dismissProfileOnboarding,
  isOnboardingDismissed,
} from "@/lib/utils/onboarding";

interface UseProfileOnboardingOptions {
  userId?: string;
  userProfile: SerializableUserProfile | null;
  isLoading: boolean;
  error: string | null;
}

interface UseProfileOnboardingReturn {
  shouldShowOnboarding: boolean;
  dismissOnboarding: () => void;
}

/**
 * Determines whether to show first-run profile onboarding on /generate.
 * Shows when the user has no saved profile and has not skipped onboarding.
 */
export function useProfileOnboarding({
  userId,
  userProfile,
  isLoading,
  error,
}: UseProfileOnboardingOptions): UseProfileOnboardingReturn {
  const [dismissedForUserId, setDismissedForUserId] = useState<string | null>(
    null
  );

  const storageDismissed = userId ? isOnboardingDismissed(userId) : false;
  const sessionDismissed =
    userId != null && dismissedForUserId === userId;

  const dismissOnboarding = useCallback(() => {
    if (!userId) return;
    dismissProfileOnboarding(userId);
    setDismissedForUserId(userId);
  }, [userId]);

  const shouldShowOnboarding =
    Boolean(userId) &&
    !isLoading &&
    !error &&
    userProfile == null &&
    !storageDismissed &&
    !sessionDismissed;

  return { shouldShowOnboarding, dismissOnboarding };
}
