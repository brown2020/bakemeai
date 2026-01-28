"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { PageLayout } from "@/components/PageLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { selectDisplayRecipe } from "@/lib/store/recipe-selectors";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUserProfileStore } from "@/lib/store/user-profile-store";
import { useRecipeGeneration } from "@/hooks/useRecipeGeneration";
import { useRecipeSave } from "@/hooks/useRecipeSave";

import { ModeSelector } from "./components/ModeSelector";
import { RecipeForm } from "./components/RecipeForm";
import { RecipeDisplay } from "./components/RecipeDisplay";
import { ErrorMessage } from "./components/ErrorMessage";
import { Mode } from "./types";

export default function Generate() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { userProfile, fetchUserProfile } = useUserProfileStore();
  const userId = user?.uid;

  const {
    structuredRecipe,
    mode,
    setMode,
    resetRecipe,
  } = useRecipeStore();

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

  // Custom hook for save logic
  const {
    saveRecipe,
    isSaving,
    saveError,
    saved,
  } = useRecipeSave();

  // Fetch user profile when user ID changes
  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId, fetchUserProfile]);

  const handleSave = useCallback(async () => {
    if (userId) {
      await saveRecipe(userId);
      // Refresh the router cache to ensure saved recipes are updated
      router.refresh();
    }
  }, [saveRecipe, userId, router]);

  const handleBack = useCallback(() => {
    setMode(null);
    resetRecipe();
  }, [setMode, resetRecipe]);

  return (
    <PageLayout title="Generate Recipe">
      <div className="space-y-6">
        {!mode ? (
          <ErrorBoundary variant="feature" featureName="Mode Selection">
            <ModeSelector onSelectMode={setMode} />
          </ErrorBoundary>
        ) : (
          <>
            <ErrorBoundary variant="feature" featureName="Recipe Form">
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
            </ErrorBoundary>

            {validationError && <ErrorMessage message={validationError} />}
            {generationError && <ErrorMessage message={generationError} />}

            {structuredRecipe && (
              <ErrorBoundary variant="feature" featureName="Recipe Display">
                <RecipeDisplay
                  parsedRecipe={selectDisplayRecipe(structuredRecipe)!}
                  onSave={handleSave}
                  isSaving={isSaving}
                  saved={saved}
                  isGenerating={isGenerating}
                  saveError={saveError || ""}
                />
              </ErrorBoundary>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
