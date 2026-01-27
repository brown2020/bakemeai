"use client";

import { useCallback, useEffect, useState, useRef } from "react";
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
import { RECIPE_PROMPTS } from "./constants";
import { Mode } from "./types";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUserProfileStore } from "@/lib/store/user-profile-store";
import {
  specificRecipeInputSchema,
  ingredientsRecipeInputSchema,
} from "@/lib/schemas";
import { useDebounce, AI_GENERATION_DEBOUNCE_MS } from "@/hooks/useDebounce";

// Rate limiting: Minimum time between recipe generation submissions (milliseconds)
const MIN_SUBMISSION_INTERVAL_MS = AI_GENERATION_DEBOUNCE_MS;

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);

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

  // Core generation logic without debouncing
  const performGeneration = useCallback(
    async (prompt: string, isIngredientsMode: boolean) => {
      await generateRecipeContent(prompt, isIngredientsMode, userProfile);
    },
    [generateRecipeContent, userProfile]
  );

  // Debounced version for rate limiting
  const debouncedGeneration = useDebounce(
    performGeneration,
    AI_GENERATION_DEBOUNCE_MS
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Rate limiting: prevent rapid consecutive submissions
      const now = Date.now();
      if (now - lastSubmitTimeRef.current < MIN_SUBMISSION_INTERVAL_MS) {
        setValidationError("Please wait a moment before generating another recipe.");
        return;
      }
      lastSubmitTimeRef.current = now;

      resetSaveState();
      setValidationError(null);

      // Validate input based on mode using Zod schemas
      const promptInput = mode === "specific" ? input : ingredients;
      const schema =
        mode === "specific"
          ? specificRecipeInputSchema
          : ingredientsRecipeInputSchema;

      const validation = schema.safeParse(promptInput);
      if (!validation.success) {
        setValidationError(validation.error.issues[0].message);
        return;
      }

      // Generate appropriate prompt based on mode
      const promptFn =
        mode === "specific"
          ? RECIPE_PROMPTS.specific
          : RECIPE_PROMPTS.ingredients;

      const prompt = promptFn(validation.data);

      // Generate recipe with debouncing
      debouncedGeneration(prompt, mode === "ingredients");
    },
    [
      mode,
      input,
      ingredients,
      resetSaveState,
      debouncedGeneration,
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
          <FeatureErrorBoundary featureName="Mode Selection">
            <ModeSelector onSelectMode={handleModeSelect} />
          </FeatureErrorBoundary>
        ) : (
          <>
            <FeatureErrorBoundary featureName="Recipe Form">
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
            </FeatureErrorBoundary>

            {validationError && <ErrorMessage message={validationError} />}
            {generationError && <ErrorMessage message={generationError} />}

            {recipe && (
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
