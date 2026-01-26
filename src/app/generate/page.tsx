"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import PageLayout from "@/components/PageLayout";
import { LoadingSpinner } from "@/components/ui";
import {
  ModeSelector,
  RecipeForm,
  RecipeDisplay,
  ErrorMessage,
} from "./components";
import { RECIPE_PROMPTS } from "./constants";
import { Mode } from "./types";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUserProfileStore } from "@/lib/store/user-profile-store";

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
    recipe,
    parsedRecipe,
    isGenerating,
    generationError,
    input,
    ingredients,
    mode,
    isSaving,
    saveError,
    saved,
    setInput,
    setIngredients,
    setMode,
    generateRecipeContent,
    saveRecipeToDb,
    resetRecipe,
    resetSaveState,
  } = useRecipeStore();

  // Fetch user profile when user is available
  useEffect(() => {
    if (user?.uid) {
      fetchUserProfile(user.uid);
    }
  }, [user?.uid, fetchUserProfile]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      resetSaveState();

      if (mode === "specific" && !input.trim()) {
        return;
      }

      if (mode === "ingredients" && !ingredients.trim()) {
        return;
      }

      const promptFn =
        mode === "specific"
          ? RECIPE_PROMPTS.specific
          : RECIPE_PROMPTS.ingredients;

      const promptInput = mode === "specific" ? input : ingredients;
      const prompt = promptFn(promptInput);

      await generateRecipeContent(prompt, mode === "ingredients", userProfile);
    },
    [
      mode,
      input,
      ingredients,
      resetSaveState,
      generateRecipeContent,
      userProfile,
    ]
  );

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
          <ModeSelector onSelectMode={handleModeSelect} />
        ) : (
          <>
            <RecipeForm
              mode={mode}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isLoading={isGenerating}
              input={input}
              onInputChange={setInput}
              ingredients={ingredients}
              onIngredientsChange={setIngredients}
            />

            {generationError && <ErrorMessage message={generationError} />}

            {recipe && (
              <RecipeDisplay
                parsedRecipe={parsedRecipe}
                onSave={handleSave}
                isSaving={isSaving}
                saved={saved}
                isGenerating={isGenerating}
                saveError={saveError || ""}
              />
            )}
          </>
        )}
      </div>
    </Suspense>
  );
}
