import { useCallback, useRef, useState } from "react";
import { useRecipeStore } from "@/lib/store/recipe-store";
import { useDebounce, AI_GENERATION_DEBOUNCE_MS } from "@/hooks/useDebounce";
import { SerializableUserProfile } from "@/lib/schemas";
import {
  specificRecipeInputSchema,
  ingredientsRecipeInputSchema,
} from "@/lib/schemas";
import { RECIPE_PROMPTS } from "@/app/generate/constants";

export interface UseRecipeGenerationReturn {
  isGenerating: boolean;
  generationError: string | null;
  validationError: string | null;
  input: string;
  ingredients: string;
  mode: "specific" | "ingredients" | null;
  setInput: (input: string) => void;
  setIngredients: (ingredients: string) => void;
  handleGenerate: (e: React.FormEvent) => Promise<void>;
}

/**
 * Custom hook for recipe generation logic.
 * Encapsulates generation flow: validation -> rate limiting -> debounced generation.
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
    generateRecipeContent,
    resetSaveState,
  } = useRecipeStore();

  const debouncedGeneration = useDebounce(
    useCallback(
      async (prompt: string, isIngredientsMode: boolean) => {
        await generateRecipeContent(prompt, isIngredientsMode, userProfile);
      },
      [generateRecipeContent, userProfile]
    ),
    AI_GENERATION_DEBOUNCE_MS
  );

  const validateInput = useCallback((promptInput: string): string | null => {
    const schema = mode === "specific" 
      ? specificRecipeInputSchema 
      : ingredientsRecipeInputSchema;
    
    const validation = schema.safeParse(promptInput);
    return validation.success ? null : validation.error.issues[0].message;
  }, [mode]);

  const handleGenerate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Rate limiting check
      const now = Date.now();
      if (now - lastSubmitTimeRef.current < AI_GENERATION_DEBOUNCE_MS) {
        setValidationError("Please wait a moment before generating another recipe.");
        return;
      }
      lastSubmitTimeRef.current = now;

      resetSaveState();
      setValidationError(null);

      // Validate input
      const promptInput = mode === "specific" ? input : ingredients;
      const error = validateInput(promptInput);
      if (error) {
        setValidationError(error);
        return;
      }

      // Generate prompt and trigger generation
      const promptFn = mode === "specific" 
        ? RECIPE_PROMPTS.specific 
        : RECIPE_PROMPTS.ingredients;
      const prompt = promptFn(promptInput);

      debouncedGeneration(prompt, mode === "ingredients");
    },
    [mode, input, ingredients, resetSaveState, debouncedGeneration, validateInput]
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
