import { useCallback, useRef, useState } from "react";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useDebounce, AI_GENERATION_DEBOUNCE_MS } from "@/hooks/useDebounce";
import { SerializableUserProfile } from "@/lib/schemas";
import {
  specificRecipeInputSchema,
  ingredientsRecipeInputSchema,
} from "@/lib/schemas";
import { RECIPE_PROMPTS } from "@/app/generate/constants";

/**
 * Custom hook for recipe generation logic.
 * Encapsulates all generation-related state and validation logic.
 * 
 * Benefits:
 * - Centralizes generation logic for reusability
 * - Handles validation and rate limiting
 * - Provides clean API for components
 * - Makes testing easier
 * 
 * @param userProfile - User profile for personalized recipes
 * @returns Generation state and handler functions
 */
export function useRecipeGeneration(userProfile: SerializableUserProfile | null) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);

  const {
    isGenerating,
    generationError,
    input,
    ingredients,
    mode,
    setInput,
    setIngredients,
    generateRecipeContent,
    resetSaveState,
  } = useRecipeStore();

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

  /**
   * Handles recipe generation form submission.
   * Validates input, enforces rate limiting, and triggers generation.
   */
  const handleGenerate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Rate limiting: prevent rapid consecutive submissions
      const now = Date.now();
      if (now - lastSubmitTimeRef.current < AI_GENERATION_DEBOUNCE_MS) {
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

  return {
    // State
    isGenerating,
    generationError,
    validationError,
    input,
    ingredients,
    mode,
    
    // Actions
    setInput,
    setIngredients,
    handleGenerate,
    clearValidationError: () => setValidationError(null),
  };
}
