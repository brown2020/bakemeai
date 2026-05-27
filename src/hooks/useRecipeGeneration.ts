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
import {
  appendTweakToPrompt,
  validateTweak,
} from "@/lib/utils/recipe-prompt";
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
  const schema =
    mode === "specific"
      ? specificRecipeInputSchema
      : ingredientsRecipeInputSchema;

  const validation = schema.safeParse(input);
  return validation.success ? null : validation.error.issues[0].message;
}

function buildPrompt(input: string, mode: RecipeMode): string {
  const promptFn =
    mode === "specific" ? RECIPE_PROMPTS.specific : RECIPE_PROMPTS.ingredients;
  return promptFn(input);
}

export interface UseRecipeGenerationReturn {
  isGenerating: boolean;
  generationError: string | null;
  validationError: string | null;
  input: string;
  ingredients: string;
  tweak: string;
  mode: RecipeMode | null;
  setInput: (input: string) => void;
  setIngredients: (ingredients: string) => void;
  setTweak: (tweak: string) => void;
  handleGenerate: (e: FormEvent) => Promise<void>;
  handleRegenerate: () => void;
}

/**
 * Custom hook for recipe generation orchestration.
 *
 * @param userProfile - User profile for personalized recipes
 * @returns Generation state and handler functions
 */
export function useRecipeGeneration(
  userProfile: SerializableUserProfile | null
): UseRecipeGenerationReturn {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [tweak, setTweak] = useState("");
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

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const debouncedGeneration = useDebounce(
    useCallback(
      async (prompt: string, isIngredientsMode: boolean) => {
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
            if (!signal.aborted) setStructuredRecipe(recipe);
          },
          (errorMessage) => {
            if (!signal.aborted) setGenerationError(errorMessage);
          },
          signal
        );

        if (!signal.aborted) {
          setGenerating(false);
        }
      },
      [
        setGenerating,
        setStructuredRecipe,
        setGenerationError,
        resetSaveState,
        userProfile,
      ]
    ),
    UI_TIMING.AI_GENERATION_DEBOUNCE
  );

  const triggerGeneration = useCallback(
    (tweakText: string) => {
      if (!mode) return;

      if (!canSubmit(lastSubmitTimeRef.current, UI_TIMING.AI_GENERATION_DEBOUNCE)) {
        setValidationError(ERROR_MESSAGES.RECIPE.RATE_LIMIT);
        return;
      }
      lastSubmitTimeRef.current = Date.now();

      resetSaveState();
      setValidationError(null);

      const promptInput = mode === "specific" ? input : ingredients;
      const inputValidationError = validateInput(promptInput, mode);
      if (inputValidationError) {
        setValidationError(inputValidationError);
        return;
      }

      const tweakValidationError = validateTweak(tweakText);
      if (tweakValidationError) {
        setValidationError(tweakValidationError);
        return;
      }

      const prompt = appendTweakToPrompt(buildPrompt(promptInput, mode), tweakText);
      debouncedGeneration(prompt, mode === "ingredients");
    },
    [mode, input, ingredients, resetSaveState, debouncedGeneration]
  );

  const handleGenerate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      triggerGeneration("");
    },
    [triggerGeneration]
  );

  const handleRegenerate = useCallback(() => {
    triggerGeneration(tweak);
  }, [triggerGeneration, tweak]);

  return {
    isGenerating,
    generationError,
    validationError,
    input,
    ingredients,
    tweak,
    mode,
    setInput,
    setIngredients,
    setTweak,
    handleGenerate,
    handleRegenerate,
  };
}
