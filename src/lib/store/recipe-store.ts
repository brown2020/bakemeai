/**
 * Recipe store - manages recipe generation and saving state.
 * 
 * ARCHITECTURE:
 * - Pure UI state management (no business logic or orchestration)
 * - Single source of truth: structuredRecipe (all display formats derived via selectors)
 * - Computed values: Use selector functions from recipe-selectors.ts (not store methods)
 * - Only persists user input (mode, input, ingredients), not generated recipes
 * - Orchestration logic lives in hooks/components, not in store
 * 
 * SELECTORS:
 * For derived data, use selector functions instead of store methods:
 * - selectDisplayRecipe(structuredRecipe) - converts to display format
 * 
 * See: recipe-selectors.ts for pure selector functions
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecipeStructure, ParsedRecipe, RecipeMode } from "@/lib/schemas/recipe";
import { convertToMarkdown, formatRecipeBodyAsMarkdown } from "@/lib/utils/markdown";

interface RecipeState {
  // Single source of truth for recipe data
  structuredRecipe: RecipeStructure | null;
  
  // Generation State
  isGenerating: boolean;
  generationError: string | null;

  // Input State (persisted)
  input: string;
  ingredients: string;
  mode: RecipeMode | null;

  // Saving State
  isSaving: boolean;
  saveError: string | null;
  saved: boolean;

  // State setters (pure state management, no orchestration)
  setInput: (input: string) => void;
  setIngredients: (ingredients: string) => void;
  setMode: (mode: RecipeMode | null) => void;
  setStructuredRecipe: (recipe: RecipeStructure | null) => void;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationError: (error: string | null) => void;
  setIsSaving: (isSaving: boolean) => void;
  setSaveError: (error: string | null) => void;
  setSaved: (saved: boolean) => void;
  resetRecipe: () => void;
  resetSaveState: () => void;
  clearPersistedState: () => void;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      structuredRecipe: null,
      isGenerating: false,
      generationError: null,
      input: "",
      ingredients: "",
      mode: null,
      isSaving: false,
      saveError: null,
      saved: false,

      setInput: (input: string) => {
        set({ input });
      },
      setIngredients: (ingredients: string) => {
        set({ ingredients });
      },
      setMode: (mode: RecipeMode | null) => {
        set({
          mode,
          structuredRecipe: null,
          generationError: null,
          saved: false,
        });
      },

      setStructuredRecipe: (recipe: RecipeStructure | null) => {
        set({ structuredRecipe: recipe });
      },

      setGenerating: (isGenerating: boolean) => {
        set({ isGenerating });
      },

      setGenerationError: (error: string | null) => {
        set({ generationError: error });
      },

      setIsSaving: (isSaving: boolean) => {
        set({ isSaving });
      },

      setSaveError: (error: string | null) => {
        set({ saveError: error });
      },

      setSaved: (saved: boolean) => {
        set({ saved });
      },

      resetRecipe: () => {
        set({
          structuredRecipe: null,
          generationError: null,
          saved: false,
          saveError: null,
        });
      },

      resetSaveState: () => {
        set({ saved: false, saveError: null });
      },

      clearPersistedState: () => {
        set({
          input: "",
          ingredients: "",
          mode: null,
        });
      },
    }),
    {
      name: "recipe-storage",
      partialize: (state) => ({
        input: state.input,
        ingredients: state.ingredients,
        mode: state.mode,
      }),
    }
  )
);
