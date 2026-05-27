"use client";

import Link from "next/link";
import { ChefHat } from "lucide-react";

import { Button } from "@/components/Button";
import { getProfileWelcomePath } from "@/lib/utils/onboarding";

interface ProfileOnboardingBannerProps {
  onDismiss?: () => void;
  variant?: "generate" | "welcome";
}

/**
 * Prompts new users to set cooking preferences before generating recipes.
 * Accessible region with primary CTA to profile and optional skip action.
 */
export function ProfileOnboardingBanner({
  onDismiss,
  variant = "generate",
}: ProfileOnboardingBannerProps) {
  const isWelcome = variant === "welcome";

  return (
    <section
      role="region"
      aria-labelledby="profile-onboarding-title"
      className="rounded-lg border border-primary-200 bg-primary-50 p-4 sm:p-5"
    >
      <div className="flex gap-3 sm:gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600"
          aria-hidden="true"
        >
          <ChefHat className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2
              id="profile-onboarding-title"
              className="text-base font-semibold text-gray-900"
            >
              {isWelcome
                ? "Welcome to Bake.me"
                : "Personalize your recipes"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {isWelcome
                ? "Set your dietary preferences, allergies, and cooking experience so your first recipes match how you actually cook."
                : "Add dietary preferences, allergies, and cooking experience so generated recipes respect your needs."}
            </p>
          </div>
          {!isWelcome && onDismiss && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link href={getProfileWelcomePath()} className="sm:w-auto w-full">
                <Button className="w-full sm:w-auto">Set up preferences</Button>
              </Link>
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={onDismiss}
              >
                Skip for now
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
