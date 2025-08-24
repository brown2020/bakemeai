"use client";

import { useState, useCallback } from "react";
import { useCompletion } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import PageLayout from "@/components/PageLayout";
import {
  RecipeGenerationProvider,
  useRecipeGeneration,
  UserProfileProvider,
  RecipeSavingProvider,
  useRecipeSaving,
} from "./hooks";
import {
  ModeSelector,
  RecipeForm,
  RecipeDisplay,
  ErrorMessage,
} from "./components";
import { RECIPE_PROMPTS } from "./constants";
import { Mode } from "./types";

// Main component
export default function GeneratePage() {
  return (
    <PageLayout title="Generate Recipe">
      <UserProfileProvider>
        <RecipeGenerationProvider>
          <RecipeSavingProvider>
            <GenerateContent />
          </RecipeSavingProvider>
        </RecipeGenerationProvider>
      </UserProfileProvider>
    </PageLayout>
  );
}

function GenerateContent() {
  const [mode, setMode] = useState<Mode>(null);
  const [ingredients, setIngredients] = useState<string>("");
  const { input, handleInputChange } = useCompletion();
  const router = useRouter();

  const {
    recipe,
    isLoading,
    isGenerating,
    error: generationError,
    parsedRecipe,
    generateRecipeContent,
    resetRecipe,
    userProfile,
  } = useRecipeGeneration();

  const { isSaving, saveError, saved, saveRecipeToDb, resetSaveState } =
    useRecipeSaving();

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

  const handleSave = useCallback(() => {
    saveRecipeToDb(recipe);
    // Refresh the router cache to ensure saved recipes are updated
    router.refresh();
  }, [saveRecipeToDb, recipe, router]);

  const handleModeSelect = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      resetRecipe();
    },
    [resetRecipe]
  );

  const handleBack = useCallback(() => {
    setMode(null);
    resetRecipe();
  }, [resetRecipe]);

  return (
    <Suspense
      fallback={
        <div className="animate-pulse h-96 bg-gray-100 rounded-lg"></div>
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
              isLoading={isLoading}
              input={input}
              handleInputChange={handleInputChange}
              ingredients={ingredients}
              setIngredients={setIngredients}
            />

            {generationError && <ErrorMessage message={generationError} />}

            {recipe && (
              <RecipeDisplay
                parsedRecipe={parsedRecipe}
                onSave={handleSave}
                isSaving={isSaving}
                saved={saved}
                isGenerating={isGenerating}
                saveError={saveError}
              />
            )}
          </>
        )}
      </div>
    </Suspense>
  );
}
