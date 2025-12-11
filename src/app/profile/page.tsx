"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { getUserProfile, saveUserProfile } from "@/lib/db";
import { UserProfile } from "@/lib/types";
import { ChipSelect, TagInput, NumberInput } from "@/components/ui";
import {
  DIETARY_OPTIONS,
  CUISINE_OPTIONS,
  EXPERIENCE_LEVELS,
  CookingExperience,
} from "@/lib/constants";

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
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Please sign in to view your preferences
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Cooking Preferences
            </h1>
          </div>
          <div className="bg-white rounded-lg shadow-xs p-3 sm:p-6 border border-surface-200 max-w-2xl">
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded-sm w-1/4 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-20 bg-gray-200 rounded-full"
                    />
                  ))}
                </div>
              </div>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded-sm w-1/4 mb-3" />
                <div className="h-10 bg-gray-200 rounded-sm w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Cooking Preferences
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-xs p-3 sm:p-6 border border-surface-200 max-w-2xl">
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

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 text-sm font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
