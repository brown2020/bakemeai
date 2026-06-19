"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useUserProfileStore } from "@/lib/store/user-profile-store";
import { getUserProfile, saveUserProfile } from "@/lib/db";
import type { UserProfile, UserProfileInput } from "@/lib/schemas/user";
import { NUMBER_INPUT, UI_TIMING } from "@/lib/constants/ui";
import { ERROR_MESSAGES, convertErrorToMessage } from "@/lib/utils/error-handler";
import { logError } from "@/lib/utils/logger";

const DEFAULT_PROFILE_INPUT: UserProfileInput = {
  dietary: [],
  allergies: [],
  dislikedIngredients: [],
  cookingExperience: "beginner",
  servingSize: NUMBER_INPUT.SERVING_SIZE_DEFAULT,
  preferredCuisines: [],
};

type ArrayProfileField =
  | "dietary"
  | "allergies"
  | "dislikedIngredients"
  | "preferredCuisines";

interface UseProfileFormOptions {
  userId?: string;
  isWelcomeFlow: boolean;
  onWelcomeComplete: () => void;
}

interface UseProfileFormReturn {
  profile: UserProfileInput;
  setProfileField: <Field extends keyof UserProfileInput>(
    field: Field,
    value: UserProfileInput[Field]
  ) => void;
  toggleArrayItem: (field: ArrayProfileField, value: string) => void;
  handleSubmit: (event: FormEvent) => Promise<void>;
  loadedProfile: UserProfile | null;
  isLoading: boolean;
  loadError: string | null;
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
}

function getDefaultProfileInput(): UserProfileInput {
  return {
    ...DEFAULT_PROFILE_INPUT,
    dietary: [],
    allergies: [],
    dislikedIngredients: [],
    preferredCuisines: [],
  };
}

function toProfileInput(profile: UserProfileInput): UserProfileInput {
  return {
    dietary: profile.dietary,
    allergies: profile.allergies,
    dislikedIngredients: profile.dislikedIngredients,
    cookingExperience: profile.cookingExperience,
    servingSize: profile.servingSize,
    preferredCuisines: profile.preferredCuisines,
  };
}

/**
 * Orchestrates profile loading, editing, and saving.
 */
export function useProfileForm({
  userId,
  isWelcomeFlow,
  onWelcomeComplete,
}: UseProfileFormOptions): UseProfileFormReturn {
  const { setUserProfile } = useUserProfileStore();
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfileInput>(
    getDefaultProfileInput
  );

  const {
    data: loadedProfile,
    isLoading,
    error: loadError,
  } = useFirestoreQuery({
    queryFn: getUserProfile,
    userId,
    errorMessage: "Failed to load profile. Please refresh the page.",
  });

  useEffect(() => {
    if (loadedProfile) {
      setProfile(toProfileInput(loadedProfile));
    } else if (!isLoading) {
      setProfile(getDefaultProfileInput());
    }
  }, [loadedProfile, isLoading]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const setProfileField = useCallback(
    <Field extends keyof UserProfileInput>(
      field: Field,
      value: UserProfileInput[Field]
    ): void => {
      setProfile((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const toggleArrayItem = useCallback(
    (field: ArrayProfileField, value: string): void => {
      setProfile((current) => {
        const selected = current[field];
        const next = selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value];
        return { ...current, [field]: next };
      });
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: FormEvent): Promise<void> => {
      event.preventDefault();
      if (!userId) return;

      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      if (successTimerRef.current) clearTimeout(successTimerRef.current);

      try {
        await saveUserProfile(userId, profile);
        setUserProfile({ id: userId, ...profile });

        if (isWelcomeFlow) {
          onWelcomeComplete();
          return;
        }

        setSaveSuccess(true);
        successTimerRef.current = setTimeout(
          () => setSaveSuccess(false),
          UI_TIMING.SUCCESS_MESSAGE_DURATION
        );
      } catch (error) {
        logError("Error saving user profile", error, { userId });
        const message = convertErrorToMessage(
          error,
          ERROR_MESSAGES.PROFILE.SAVE_FAILED
        );
        setSaveError(message);
      } finally {
        setSaving(false);
      }
    },
    [userId, profile, isWelcomeFlow, onWelcomeComplete, setUserProfile]
  );

  return {
    profile,
    setProfileField,
    toggleArrayItem,
    handleSubmit,
    loadedProfile,
    isLoading,
    loadError,
    saving,
    saveError,
    saveSuccess,
  };
}
