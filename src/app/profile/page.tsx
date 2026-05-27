"use client";

import { Suspense, useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ui/ChipSelect";
import { TagInput } from "@/components/ui/TagInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ProfileOnboardingBanner } from "@/components/ProfileOnboardingBanner";
import { useAuthStore } from "@/lib/store/auth-store";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useUserProfileStore } from "@/lib/store/user-profile-store";
import { getUserProfile, saveUserProfile } from "@/lib/db";
import type { UserProfileInput } from "@/lib/schemas/user";
import type { CookingExperience } from "@/lib/constants/domain";
import {
  DIETARY_OPTIONS,
  CUISINE_OPTIONS,
  EXPERIENCE_LEVELS,
} from "@/lib/constants/domain";
import { PROFILE_WELCOME_QUERY } from "@/lib/constants/onboarding";
import { UI_TIMING, NUMBER_INPUT } from "@/lib/constants/ui";
import { convertErrorToMessage, ERROR_MESSAGES } from "@/lib/utils/error-handler";
import { isProfileWelcomeSearchParam } from "@/lib/utils/onboarding";
import { logError } from "@/lib/utils/logger";

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcomeFlow = isProfileWelcomeSearchParam(
    searchParams.get(PROFILE_WELCOME_QUERY)
  );

  const { user } = useAuthStore();
  const { setUserProfile } = useUserProfileStore();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfileInput>({
    dietary: [],
    allergies: [],
    dislikedIngredients: [],
    cookingExperience: "beginner",
    servingSize: NUMBER_INPUT.SERVING_SIZE_DEFAULT,
    preferredCuisines: [],
  });

  const {
    data: loadedProfile,
    isLoading,
    error: loadError,
  } = useFirestoreQuery({
    queryFn: getUserProfile,
    userId: user?.uid,
    errorMessage: "Failed to load profile. Please refresh the page.",
  });

  useEffect(() => {
    if (loadedProfile) {
      setProfile({
        dietary: loadedProfile.dietary,
        allergies: loadedProfile.allergies,
        dislikedIngredients: loadedProfile.dislikedIngredients,
        cookingExperience: loadedProfile.cookingExperience,
        servingSize: loadedProfile.servingSize,
        preferredCuisines: loadedProfile.preferredCuisines,
      });
    }
  }, [loadedProfile]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!user) return;

      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      try {
        await saveUserProfile(user.uid, profile);
        setUserProfile({ id: user.uid, ...profile });

        if (isWelcomeFlow) {
          router.push("/generate");
          return;
        }

        setSaveSuccess(true);
        setTimeout(
          () => setSaveSuccess(false),
          UI_TIMING.SUCCESS_MESSAGE_DURATION
        );
      } catch (error) {
        logError("Error saving user profile", error, { userId: user?.uid });
        const message = convertErrorToMessage(
          error,
          ERROR_MESSAGES.PROFILE.SAVE_FAILED
        );
        setSaveError(message);
      } finally {
        setSaving(false);
      }
    },
    [user, profile, isWelcomeFlow, router, setUserProfile]
  );

  const toggleArrayItem = useCallback(
    (
      field:
        | "dietary"
        | "allergies"
        | "dislikedIngredients"
        | "preferredCuisines",
      value: string
    ): void => {
      setProfile((prev) => {
        const current = prev[field] as string[];
        const next = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        return { ...prev, [field]: next };
      });
    },
    []
  );

  if (isLoading) {
    return (
      <PageLayout title="Cooking Preferences">
        <div className="bg-white rounded-lg shadow-xs p-6 border border-surface-200 max-w-2xl">
          <PageSkeleton rows={4} showTitle={false} />
        </div>
      </PageLayout>
    );
  }

  const showWelcomeBanner = isWelcomeFlow && !loadedProfile;

  return (
    <PageLayout title="Cooking Preferences">
      {loadError && <ErrorMessage message={loadError} />}

      <div className="max-w-2xl space-y-4">
        {showWelcomeBanner && <ProfileOnboardingBanner variant="welcome" />}

        <div className="bg-white rounded-lg shadow-xs p-4 sm:p-6 border border-surface-200">
          {saveError && <ErrorMessage message={saveError} />}
          {saveSuccess && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              Preferences saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <ChipSelect
              label="Dietary Preferences"
              options={[...DIETARY_OPTIONS]}
              selected={profile.dietary}
              onChange={(option) => toggleArrayItem("dietary", option)}
            />

            <TagInput
              label="Allergies"
              value={profile.allergies}
              onChange={(allergies) =>
                setProfile((prev) => ({ ...prev, allergies }))
              }
              placeholder="e.g., peanuts, shellfish (comma separated)"
            />

            <TagInput
              label="Ingredients You Dislike"
              value={profile.dislikedIngredients}
              onChange={(dislikedIngredients) =>
                setProfile((prev) => ({ ...prev, dislikedIngredients }))
              }
              placeholder="e.g., cilantro, olives (comma separated)"
            />

            <ChipSelect
              label="Preferred Cuisines"
              options={[...CUISINE_OPTIONS]}
              selected={profile.preferredCuisines}
              onChange={(cuisine) =>
                toggleArrayItem("preferredCuisines", cuisine)
              }
            />

            <ChipSelect
              label="Cooking Experience"
              options={EXPERIENCE_LEVELS.map((l) => l.label)}
              selected={[
                EXPERIENCE_LEVELS.find(
                  (l) => l.value === profile.cookingExperience
                )?.label ?? "Beginner",
              ]}
              onChange={(label) => {
                const level = EXPERIENCE_LEVELS.find((l) => l.label === label);
                if (level) {
                  setProfile((prev) => ({
                    ...prev,
                    cookingExperience: level.value as CookingExperience,
                  }));
                }
              }}
              variant="rounded"
            />

            <NumberInput
              label="Default Serving Size"
              value={profile.servingSize}
              onChange={(servingSize) =>
                setProfile((prev) => ({ ...prev, servingSize }))
              }
              min={NUMBER_INPUT.SERVING_SIZE_MIN}
              max={NUMBER_INPUT.SERVING_SIZE_MAX}
            />

            <Button type="submit" isLoading={saving} className="w-full">
              {isWelcomeFlow ? "Save and start cooking" : "Save Preferences"}
            </Button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}

function ProfilePageFallback() {
  return (
    <PageLayout title="Cooking Preferences">
      <div className="bg-white rounded-lg shadow-xs p-6 border border-surface-200 max-w-2xl">
        <PageSkeleton rows={4} showTitle={false} />
      </div>
    </PageLayout>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<ProfilePageFallback />}>
      <ProfilePageContent />
    </Suspense>
  );
}
