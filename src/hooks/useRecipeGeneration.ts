import { useCallback, useRef, useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useDebounce } from "@/hooks/useDebounce";
import type { SerializableUserProfile } from "@/lib/schemas/user";
import type { RecipeMode } from "@/lib/schemas/recipe";
import {
  specificRecipeInputSchema,
  ingredientsRecipeInputSchema,
} from "@/lib/schemas/recipe";
import { RECIPE_PROMPTS } from "@/app/generate/constants";
import { generateRecipeWithStreaming } from "@/lib/services/recipe-service";
import { UI_TIMING } from "@/lib/constants/ui";
import { ERROR_MESSAGES } from "@/lib/utils/error-handler";

/**
 * Checks if enough time has passed since last submission for rate limiting.
 */
function canSubmit(lastSubmitTime: number, debounceMs: number): boolean {
  return Date.now() - lastSubmitTime >= debounceMs;
}

/**
 * Validates recipe input based on mode.
 */
function validateInput(input: string, mode: RecipeMode): string | null {
  const schema = mode === "specific" 
    ? specificRecipeInputSchema 
    : ingredientsRecipeInputSchema;
  
  const validation = schema.safeParse(input);
  return validation.success ? null : validation.error.issues[0].message;
}

/**
 * Builds prompt from input based on mode.
 */
function buildPrompt(input: string, mode: RecipeMode): string {
  const promptFn = mode === "specific" 
    ? RECIPE_PROMPTS.specific 
    : RECIPE_PROMPTS.ingredients;
  return promptFn(input);
}

export interface UseRecipeGenerationReturn {
  isGenerating: boolean;
  generationError: string | null;
  validationError: string | null;
  input: string;
  ingredients: string;
  mode: RecipeMode | null;
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
 * RETURN PATTERN:
 * - Returns object with named properties (standard for hooks with 3+ return values)
 * - Allows destructuring: const { isGenerating, handleGenerate } = useRecipeGeneration()
 * - Avoids array returns which require remembering positional order
 * 
 * @param userProfile - User profile for personalized recipes
 * @returns Generation state and handler functions
 */
export function useRecipeGeneration(userProfile: SerializableUserProfile | null): UseRecipeGenerationReturn {
  const [validationError, setValidationError] = useState<string | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Debounced generation with service orchestration and abort support
  const debouncedGeneration = useDebounce(
    useCallback(
      async (prompt: string, isIngredientsMode: boolean) => {
        // Cancel any in-flight generation to prevent race conditions
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setGenerating(true);
        setStructuredRecipe(null);
        setGenerationError(null);
        resetSaveState();

        await generateRecipeWithStreaming(
          prompt,
          isIngredientsMode,
          userProfile,
          (recipe) => {
            // Only update if this request hasn't been aborted
            if (!signal.aborted) setStructuredRecipe(recipe);
          },
          (errorMessage) => {
            // Only update if this request hasn't been aborted
            if (!signal.aborted) setGenerationError(errorMessage);
          },
          signal
        );

        // Only update generating state if this request hasn't been aborted
        if (!signal.aborted) {
          setGenerating(false);
        }
      },
      [setGenerating, setStructuredRecipe, setGenerationError, resetSaveState, userProfile]
    ),
    UI_TIMING.AI_GENERATION_DEBOUNCE
  );

  const handleGenerate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      
      // Guard: mode must be set (should always be true when form is rendered)
      if (!mode) return;
      
      // Rate limiting
      if (!canSubmit(lastSubmitTimeRef.current, UI_TIMING.AI_GENERATION_DEBOUNCE)) {
        setValidationError(ERROR_MESSAGES.RECIPE.RATE_LIMIT);
        return;
      }
      lastSubmitTimeRef.current = Date.now();

      resetSaveState();
      setValidationError(null);

      // Validate input
      const promptInput = mode === "specific" ? input : ingredients;
      const validationError = validateInput(promptInput, mode);
      if (validationError) {
        setValidationError(validationError);
        return;
      }

      // Build prompt and trigger generation
      const prompt = buildPrompt(promptInput, mode);
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
