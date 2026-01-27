/**
 * Recipe store - manages recipe generation and saving state.
 * 
 * ARCHITECTURE:
 * - Pure UI state management (no business logic or orchestration)
 * - Single source of truth: structuredRecipe (all display formats derived via getters)
 * - Computed selectors transform structuredRecipe on each call (markdown conversion is cheap)
 * - Only persists user input (mode, input, ingredients), not generated recipes
 * - Orchestration logic lives in hooks/components, not in store
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RecipeStructure, ParsedRecipe } from "@/lib/schemas";
import { convertToMarkdown, buildMarkdownBody } from "@/lib/utils/markdown-converter";

interface RecipeState {
  // Single source of truth for recipe data
  structuredRecipe: RecipeStructure | null;
  
  // Generation State
  isGenerating: boolean;
  generationError: string | null;

  // Input State (persisted)
  input: string;
  ingredients: string;
  mode: "specific" | "ingredients" | null;

  // Saving State
  isSaving: boolean;
  saveError: string | null;
  saved: boolean;

  // Computed selectors
  convertToDisplayFormat: () => ParsedRecipe;
  getMarkdown: () => string;

  // State setters (pure state management, no orchestration)
  setInput: (input: string) => void;
  setIngredients: (ingredients: string) => void;
  setMode: (mode: "specific" | "ingredients" | null) => void;
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

      convertToDisplayFormat: (): ParsedRecipe => {
        const { structuredRecipe } = get();
        
        if (!structuredRecipe) {
          return { title: "", content: "" };
        }
        
        const title = structuredRecipe.title ?? "";
        const content = buildMarkdownBody(structuredRecipe);
        return { title, content, structuredData: structuredRecipe };
      },

      getMarkdown: (): string => {
        const { structuredRecipe } = get();
        return structuredRecipe ? convertToMarkdown(structuredRecipe) : "";
      },

      setInput: (input: string) => {
        set({ input });
      },
      setIngredients: (ingredients: string) => {
        set({ ingredients });
      },
      setMode: (mode: "specific" | "ingredients" | null) => {
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
