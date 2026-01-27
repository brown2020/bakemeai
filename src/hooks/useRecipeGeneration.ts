import { useCallback, useRef, useState, FormEvent } from "react";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useDebounce, AI_GENERATION_DEBOUNCE_MS } from "@/hooks/useDebounce";
import { SerializableUserProfile } from "@/lib/schemas";
import {
  specificRecipeInputSchema,
  ingredientsRecipeInputSchema,
} from "@/lib/schemas";
import { RECIPE_PROMPTS } from "@/app/generate/constants";
import { generateRecipeWithStreaming } from "@/lib/services/recipe-service";

export interface UseRecipeGenerationReturn {
  isGenerating: boolean;
  generationError: string | null;
  validationError: string | null;
  input: string;
  ingredients: string;
  mode: "specific" | "ingredients" | null;
  setInput: (input: string) => void;
  setIngredients: (ingredients: string) => void;
  handleGenerate: (e: FormEvent) => Promise<void>;
}

/**
 * Custom hook for recipe generation orchestration.
 * 
 * Responsibilities:
 * - Coordinate recipe generation flow (validation -> generation -> state updates)
 * - Manage validation and rate limiting
 * - Provide clean interface for components
 * 
 * @param userProfile - User profile for personalized recipes
 * @returns Generation state and handler functions
 */
export function useRecipeGeneration(userProfile: SerializableUserProfile | null): UseRecipeGenerationReturn {
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
    setStructuredRecipe,
    setGenerating,
    setGenerationError,
    resetSaveState,
  } = useRecipeStore();

  // Debounced generation with service orchestration
  const debouncedGeneration = useDebounce(
    useCallback(
      async (prompt: string, isIngredientsMode: boolean) => {
        setGenerating(true);
        setStructuredRecipe(null);
        setGenerationError(null);
        resetSaveState();

        await generateRecipeWithStreaming(
          prompt,
          isIngredientsMode,
          userProfile,
          (recipe) => setStructuredRecipe(recipe),
          (errorMessage) => setGenerationError(errorMessage)
        );

        setGenerating(false);
      },
      [setGenerating, setStructuredRecipe, setGenerationError, resetSaveState, userProfile]
    ),
    AI_GENERATION_DEBOUNCE_MS
  );

  const handleGenerate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      
      // Rate limiting: prevent rapid successive generations
      const now = Date.now();
      if (now - lastSubmitTimeRef.current < AI_GENERATION_DEBOUNCE_MS) {
        setValidationError("Please wait a moment before generating another recipe.");
        return;
      }
      lastSubmitTimeRef.current = now;

      resetSaveState();
      setValidationError(null);

      // Input validation based on mode
      const promptInput = mode === "specific" ? input : ingredients;
      const schema = mode === "specific" 
        ? specificRecipeInputSchema 
        : ingredientsRecipeInputSchema;
      
      const validation = schema.safeParse(promptInput);
      if (!validation.success) {
        setValidationError(validation.error.issues[0].message);
        return;
      }

      // Build prompt and trigger generation
      const promptFn = mode === "specific" 
        ? RECIPE_PROMPTS.specific 
        : RECIPE_PROMPTS.ingredients;
      const prompt = promptFn(promptInput);

      debouncedGeneration(prompt, mode === "ingredients");
    },
    [mode, input, ingredients, resetSaveState, debouncedGeneration]
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
  };
}
