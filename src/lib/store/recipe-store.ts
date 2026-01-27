/**
 * Recipe generation and management store.
 * 
 * ARCHITECTURE:
 * - Single source of truth: structuredRecipe (all display formats derived via getters)
 * - Streaming logic lives in store (tightly coupled to UI state - each partial update triggers re-render)
 * - Computed selectors use manual memoization to avoid recalculating markdown on every render
 * - Only persists user input (mode, input, ingredients), not generated recipes
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateRecipe } from "@/lib/recipe-generation.server";
import { readStreamableValue } from "@ai-sdk/rsc";
import { saveRecipe } from "@/lib/db";
import { SerializableUserProfile, RecipeStructure, ParsedRecipe, recipeStructureSchema } from "@/lib/schemas";
import { handleError, ERROR_MESSAGES } from "@/lib/utils/error-handler";
import { convertToMarkdown } from "@/lib/utils/markdown";
import { logWarning } from "@/lib/utils/logger";

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

  // Computed selectors (transform structuredRecipe on each call - not memoized)
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

// Memoization cache for computed selectors
let cachedStructuredRecipe: RecipeStructure | null = null;
let cachedParsedRecipe: ParsedRecipe | null = null;
let cachedMarkdown: string | null = null;

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      // Initial State
      structuredRecipe: null,
      isGenerating: false,
      generationError: null,
      input: "",
      ingredients: "",
      mode: null,
      isSaving: false,
      saveError: null,
      saved: false,

      // Computed selector: transforms structuredRecipe to ParsedRecipe format
      // Memoized to avoid recalculating on every render
      convertToDisplayFormat: (): ParsedRecipe => {
        const { structuredRecipe } = get();
        
        // Return cached result if structuredRecipe hasn't changed
        if (structuredRecipe === cachedStructuredRecipe && cachedParsedRecipe) {
          return cachedParsedRecipe;
        }
        
        // Recalculate and cache
        cachedStructuredRecipe = structuredRecipe;
        if (!structuredRecipe) {
          cachedParsedRecipe = { title: "", content: "" };
        } else {
          const markdown = convertToMarkdown(structuredRecipe);
          const title = structuredRecipe.title ?? "";
          const content = markdown.replace(/^# .*\n\n/, "");
          cachedParsedRecipe = { title, content, structuredData: structuredRecipe };
        }
        
        return cachedParsedRecipe;
      },

      // Computed selector: transforms structuredRecipe to markdown string
      // Memoized to avoid recalculating on every render
      getMarkdown: (): string => {
        const { structuredRecipe } = get();
        
        // Return cached result if structuredRecipe hasn't changed
        if (structuredRecipe === cachedStructuredRecipe && cachedMarkdown !== null) {
          return cachedMarkdown;
        }
        
        // Recalculate and cache
        cachedStructuredRecipe = structuredRecipe;
        cachedMarkdown = structuredRecipe ? convertToMarkdown(structuredRecipe) : "";
        
        return cachedMarkdown;
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

      /**
       * Generates recipe content with streaming AI updates.
       * Validates and stores each partial update as the AI progressively builds the recipe.
       */
      generateRecipeContent: async (prompt, isIngredientsMode, userProfile) => {
        set({
          isGenerating: true,
          structuredRecipe: null,
          generationError: null,
          saved: false,
        });

        try {
          const result = await generateRecipe(
            prompt,
            isIngredientsMode,
            userProfile
          );

          for await (const partialObject of readStreamableValue(result)) {
            if (partialObject != null) {
              // The AI SDK streams partial objects that progressively build toward the schema.
              // We validate with Zod to ensure type safety during streaming.
              const validationResult = recipeStructureSchema.safeParse(partialObject);
              if (!validationResult.success) {
                // Skip invalid partial updates during streaming
                // Log validation errors in development to help catch schema issues
                logWarning("Invalid partial recipe data during streaming", {
                  errors: validationResult.error.flatten(),
                });
                continue;
              }
              
              // Single source of truth: only store structuredRecipe
              // All display formats are derived via getters
              set({ structuredRecipe: validationResult.data });
            }
          }
        } catch (error) {
          const message = handleError(
            error,
            "Error generating recipe",
            {},
            ERROR_MESSAGES.RECIPE.GENERATION_FAILED
          );
          set({ generationError: message });
        } finally {
          set({ isGenerating: false });
        }
      },

      saveRecipeToDb: async (userId) => {
        const { structuredRecipe, getMarkdown } = get();
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
          await saveRecipe({
            userId,
            content: getMarkdown(),
            structuredData: structuredRecipe ?? undefined,
          });
          set({ saved: true });
        } catch (error) {
          const message = handleError(
            error,
            "Error saving recipe to database",
            { userId },
            ERROR_MESSAGES.RECIPE.SAVE_FAILED
          );
          set({ saveError: message });
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
