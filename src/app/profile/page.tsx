"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { getUserProfile, saveUserProfile } from "@/lib/db";
import { UserProfile } from "@/lib/types";
import {
  ChipSelect,
  TagInput,
  NumberInput,
  PageSkeleton,
} from "@/components/ui";
import {
  DIETARY_OPTIONS,
  CUISINE_OPTIONS,
  EXPERIENCE_LEVELS,
  CookingExperience,
} from "@/lib/constants";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/Button";

export default function Profile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    dietary: [],
    allergies: [],
    dislikedIngredients: [],
    cookingExperience: "beginner",
    servingSize: 2,
    preferredCuisines: [],
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await saveUserProfile(user.uid, profile as Omit<UserProfile, "id">);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  if (!user) {
    return (
      <PageLayout title="Cooking Preferences">
        <p className="text-gray-600">
          Please sign in to view your preferences.
        </p>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Cooking Preferences">
        <div className="bg-white rounded-lg shadow-xs p-6 border border-surface-200 max-w-2xl">
          <PageSkeleton rows={4} showTitle={false} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Cooking Preferences">
      <div className="bg-white rounded-lg shadow-xs p-4 sm:p-6 border border-surface-200 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ChipSelect
            label="Dietary Preferences"
            options={[...DIETARY_OPTIONS]}
            selected={profile.dietary || []}
            onChange={(option) => toggleArrayItem("dietary", option)}
          />

          <TagInput
            label="Allergies"
            value={profile.allergies || []}
            onChange={(allergies) =>
              setProfile((prev) => ({ ...prev, allergies }))
            }
            placeholder="e.g., peanuts, shellfish (comma separated)"
          />

          <TagInput
            label="Ingredients You Dislike"
            value={profile.dislikedIngredients || []}
            onChange={(dislikedIngredients) =>
              setProfile((prev) => ({ ...prev, dislikedIngredients }))
            }
            placeholder="e.g., cilantro, olives (comma separated)"
          />

          <ChipSelect
            label="Preferred Cuisines"
            options={[...CUISINE_OPTIONS]}
            selected={profile.preferredCuisines || []}
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
              )?.label || "Beginner",
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
            value={profile.servingSize || 2}
            onChange={(servingSize) =>
              setProfile((prev) => ({ ...prev, servingSize }))
            }
            min={1}
            max={12}
          />

          <Button type="submit" isLoading={saving} className="w-full">
            Save Preferences
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
