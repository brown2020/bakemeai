"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { PageLayout } from "@/components/PageLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRecipeStore, selectDisplayRecipe } from "@/lib/store/recipe-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  const userId = user?.uid;

  // Custom hook for user profile (handles fetching automatically)
  const { userProfile } = useUserProfile(userId);

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

  // Compute display recipe once to avoid repeated selector calls
  const displayRecipe = structuredRecipe ? selectDisplayRecipe(structuredRecipe) : null;

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

            {displayRecipe && (
              <ErrorBoundary variant="feature" featureName="Recipe Display">
                <RecipeDisplay
                  parsedRecipe={displayRecipe}
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
