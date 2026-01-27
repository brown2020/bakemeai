"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { PageLayout } from "@/components/PageLayout";
import { FeatureErrorBoundary } from "@/components/FeatureErrorBoundary";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUserProfileStore } from "@/lib/store/user-profile-store";
import { useRecipeGeneration } from "@/hooks/useRecipeGeneration";

import { ModeSelector } from "./components/ModeSelector";
import { RecipeForm } from "./components/RecipeForm";
import { RecipeDisplay } from "./components/RecipeDisplay";
import { ErrorMessage } from "./components/ErrorMessage";
import { Mode } from "./types";

// Main component
export default function GeneratePage() {
  return (
    <PageLayout title="Generate Recipe">
      <GenerateContent />
    </PageLayout>
  );
}

function GenerateContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { userProfile, fetchUserProfile } = useUserProfileStore();
  const userId = user?.uid;

  const {
    structuredRecipe,
    convertToDisplayFormat,
    mode,
    isSaving,
    saveError,
    saved,
    setMode,
    saveRecipeToDb,
    resetRecipe,
  } = useRecipeStore();
  
  // Derive display format from structured data
  const parsedRecipe = convertToDisplayFormat();

  // Custom hook for generation logic
  const {
    isGenerating,
    generationError,
    validationError,
    input,
    ingredients,
    setInput,
    setIngredients,
    handleGenerate,
  } = useRecipeGeneration(userProfile);

  // Fetch user profile when user ID changes
  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId, fetchUserProfile]);

  const handleSave = useCallback(async () => {
    if (userId) {
      await saveRecipeToDb(userId);
      // Refresh the router cache to ensure saved recipes are updated
      router.refresh();
    }
  }, [saveRecipeToDb, userId, router]);

  const handleModeSelect = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
    },
    [setMode]
  );

  const handleBack = useCallback(() => {
    setMode(null);
    resetRecipe();
  }, [setMode, resetRecipe]);

  return (
    <div className="space-y-6">
      {!mode ? (
        <FeatureErrorBoundary featureName="Mode Selection">
          <ModeSelector onSelectMode={handleModeSelect} />
        </FeatureErrorBoundary>
      ) : (
        <>
          <FeatureErrorBoundary featureName="Recipe Form">
            <RecipeForm
              mode={mode}
              onBack={handleBack}
              onSubmit={handleGenerate}
              isLoading={isGenerating}
              input={input}
              onInputChange={setInput}
              ingredients={ingredients}
              onIngredientsChange={setIngredients}
            />
          </FeatureErrorBoundary>

          {validationError && <ErrorMessage message={validationError} />}
          {generationError && <ErrorMessage message={generationError} />}

          {structuredRecipe && (
            <FeatureErrorBoundary featureName="Recipe Display">
              <RecipeDisplay
                parsedRecipe={parsedRecipe}
                onSave={handleSave}
                isSaving={isSaving}
                saved={saved}
                isGenerating={isGenerating}
                saveError={saveError || ""}
              />
            </FeatureErrorBoundary>
          )}
        </>
      )}
    </div>
  );
}
