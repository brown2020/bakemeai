"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import PageLayout from "@/components/PageLayout";
import { LoadingSpinner } from "@/components/ui";
import { FeatureErrorBoundary } from "@/components/FeatureErrorBoundary";
import {
  ModeSelector,
  RecipeForm,
  RecipeDisplay,
  ErrorMessage,
} from "./components";
import { Mode } from "./types";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUserProfileStore } from "@/lib/store/user-profile-store";
import { useRecipeGeneration } from "@/hooks/useRecipeGeneration";

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
    getParsedRecipe,
    mode,
    isSaving,
    saveError,
    saved,
    setMode,
    saveRecipeToDb,
    resetRecipe,
  } = useRecipeStore();
  
  // Derive display format from structured data
  const parsedRecipe = getParsedRecipe();

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

  // Fetch user profile when user is available
  useEffect(() => {
    if (user?.uid) {
      fetchUserProfile(user.uid);
    }
  }, [user?.uid, fetchUserProfile]);

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
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
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
    </Suspense>
  );
}
