/**
 * Recipe store - manages recipe generation and saving state.
 * 
 * ARCHITECTURE:
 * - UI state management only (business logic delegated to services)
 * - Single source of truth: structuredRecipe (all display formats derived via getters)
 * - Computed selectors transform structuredRecipe on each call (markdown conversion is cheap)
 * - Only persists user input (mode, input, ingredients), not generated recipes
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SerializableUserProfile, RecipeStructure, ParsedRecipe } from "@/lib/schemas";
import { convertToMarkdown } from "@/lib/utils/markdown-converter";
import { generateRecipeWithStreaming, saveRecipeToDatabase } from "@/lib/services/recipe-service";

/**
 * Removes the H1 title from markdown content.
 * Used to separate title from body content for display.
 */
function removeTitleFromMarkdown(markdown: string): string {
  return markdown.replace(/^# .*\n\n/, "");
}

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

  // Actions
  setInput: (input: string) => void;
  setIngredients: (ingredients: string) => void;
  setMode: (mode: "specific" | "ingredients" | null) => void;
  generateRecipeContent: (
    prompt: string,
    isIngredientsMode: boolean,
    userProfile: SerializableUserProfile | null
  ) => Promise<void>;
  saveRecipeToDb: (userId: string) => Promise<void>;
  resetRecipe: () => void;
  resetSaveState: () => void;
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
        
        const markdown = convertToMarkdown(structuredRecipe);
        const title = structuredRecipe.title ?? "";
        const content = removeTitleFromMarkdown(markdown);
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

      generateRecipeContent: async (prompt, isIngredientsMode, userProfile) => {
        set({
          isGenerating: true,
          structuredRecipe: null,
          generationError: null,
          saved: false,
        });

        await generateRecipeWithStreaming(
          prompt,
          isIngredientsMode,
          userProfile,
          (recipe) => set({ structuredRecipe: recipe }),
          (errorMessage) => set({ generationError: errorMessage })
        );

        set({ isGenerating: false });
      },

      saveRecipeToDb: async (userId) => {
        const { structuredRecipe } = get();
        if (!userId) {
          set({ saveError: "You must be logged in to save recipes" });
          return;
        }

        if (!structuredRecipe) {
          set({ saveError: "No recipe to save. Please generate a recipe first." });
          return;
        }

        set({ isSaving: true, saveError: null });

        try {
          await saveRecipeToDatabase(userId, structuredRecipe);
          set({ saved: true });
        } catch (error) {
          set({ saveError: error instanceof Error ? error.message : "Failed to save recipe" });
        } finally {
          set({ isSaving: false });
        }
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
