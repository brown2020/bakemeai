"use client";

import { Suspense, useCallback } from "react";
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
import { useProfileForm } from "@/hooks/useProfileForm";
import {
  DIETARY_OPTIONS,
  CUISINE_OPTIONS,
  EXPERIENCE_LEVELS,
} from "@/lib/constants/domain";
import { PROFILE_WELCOME_QUERY } from "@/lib/constants/onboarding";
import { NUMBER_INPUT } from "@/lib/constants/ui";
import { isProfileWelcomeSearchParam } from "@/lib/utils/onboarding";

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcomeFlow = isProfileWelcomeSearchParam(
    searchParams.get(PROFILE_WELCOME_QUERY)
  );

  const { user } = useAuthStore();
  const handleWelcomeComplete = useCallback(() => {
    router.push("/generate");
  }, [router]);

  const {
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
  } = useProfileForm({
    userId: user?.uid,
    isWelcomeFlow,
    onWelcomeComplete: handleWelcomeComplete,
  });

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
              onChange={(allergies) => setProfileField("allergies", allergies)}
              placeholder="e.g., peanuts, shellfish (comma separated)"
            />

            <TagInput
              label="Ingredients You Dislike"
              value={profile.dislikedIngredients}
              onChange={(dislikedIngredients) =>
                setProfileField("dislikedIngredients", dislikedIngredients)
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
                  setProfileField("cookingExperience", level.value);
                }
              }}
              variant="rounded"
            />

            <NumberInput
              label="Default Serving Size"
              value={profile.servingSize}
              onChange={(servingSize) =>
                setProfileField("servingSize", servingSize)
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
