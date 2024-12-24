"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, saveUserProfile } from "@/lib/db";
import { UserProfile } from "@/lib/types";
import PageLayout from "@/components/PageLayout";

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-free",
  "Dairy-free",
  "Keto",
  "Paleo",
];

const CUISINE_OPTIONS = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "Mediterranean",
  "American",
  "French",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function Profile() {
  const { user } = useAuth();
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

  const handleMultiSelect = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field]?.includes(value)
          ? (prev[field] as string[]).filter((item: string) => item !== value)
          : [...(prev[field] as string[]), value]
        : [value],
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to view your profile
          </h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Profile">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </PageLayout>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Cooking Preferences
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div>
            <label className="block text-base sm:text-lg font-medium mb-3 sm:mb-4">
              Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleMultiSelect("dietary", option)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm ${
                    profile.dietary?.includes(option)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              Allergies & Intolerances
            </label>
            <input
              type="text"
              value={profile.allergies?.join(", ")}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  allergies: e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="e.g., peanuts, shellfish (comma separated)"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              Ingredients You Dislike
            </label>
            <input
              type="text"
              value={profile.dislikedIngredients?.join(", ")}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  dislikedIngredients: e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="e.g., cilantro, olives (comma separated)"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium mb-3 sm:mb-4">
              Preferred Cuisines
            </label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() =>
                    handleMultiSelect("preferredCuisines", cuisine)
                  }
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm ${
                    profile.preferredCuisines?.includes(cuisine)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium mb-3 sm:mb-4">
              Cooking Experience
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() =>
                    setProfile((prev) => ({
                      ...prev,
                      cookingExperience:
                        level.value as UserProfile["cookingExperience"],
                    }))
                  }
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm ${
                    profile.cookingExperience === level.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              Default Serving Size
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={profile.servingSize}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  servingSize: parseInt(e.target.value),
                }))
              }
              className="w-32 p-3 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      </div>
    </div>
  );
}
