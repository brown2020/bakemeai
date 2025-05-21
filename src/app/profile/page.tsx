"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile, saveUserProfile } from "@/lib/db";
import { UserProfile } from "@/lib/types";
import DietaryOptions from "./components/DietaryOptions";
import AllergiesInput from "./components/AllergiesInput";
import DislikedIngredientsInput from "./components/DislikedIngredientsInput";
import PreferredCuisines from "./components/PreferredCuisines";
import CookingExperience from "./components/CookingExperience";
import ServingSizeInput from "./components/ServingSizeInput";

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

const EXPERIENCE_LEVELS: { value: "beginner" | "intermediate" | "advanced"; label: string }[] = [
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
    setProfile((prev) => {
      if (field === "cookingExperience") {
        // Only allow valid values for cookingExperience
        if (["beginner", "intermediate", "advanced"].includes(value)) {
          return { ...prev, cookingExperience: value as UserProfile["cookingExperience"] };
        }
        return prev;
      }
      return {
        ...prev,
        [field]: Array.isArray(prev[field])
          ? prev[field]?.includes(value)
            ? (prev[field] as string[]).filter((item: string) => item !== value)
            : [...(prev[field] as string[]), value]
          : [value],
      };
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
            <DietaryOptions
              options={DIETARY_OPTIONS}
              selected={profile.dietary || []}
              onChange={(option: string) => handleMultiSelect("dietary", option)}
            />

            <AllergiesInput
              value={profile.allergies || []}
              onChange={(allergies: string[]) => setProfile((prev) => ({ ...prev, allergies }))}
            />

            <DislikedIngredientsInput
              value={profile.dislikedIngredients || []}
              onChange={(dislikedIngredients: string[]) => setProfile((prev) => ({ ...prev, dislikedIngredients }))}
            />

            <PreferredCuisines
              options={CUISINE_OPTIONS}
              selected={profile.preferredCuisines || []}
              onChange={(cuisine) => handleMultiSelect("preferredCuisines", cuisine)}
            />

            <CookingExperience
              levels={EXPERIENCE_LEVELS}
              selected={profile.cookingExperience || "beginner"}
              onChange={(level: "beginner" | "intermediate" | "advanced") => setProfile((prev) => ({ ...prev, cookingExperience: level }))}
            />

            <ServingSizeInput
              value={profile.servingSize || 2}
              onChange={(servingSize) => setProfile((prev) => ({ ...prev, servingSize }))}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 text-sm font-medium"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
