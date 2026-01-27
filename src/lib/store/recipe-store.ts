import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateRecipe } from "@/lib/actions";
import { readStreamableValue } from "@ai-sdk/rsc";
import { saveRecipe } from "@/lib/db";
import { SerializableUserProfile, RecipeStructure, ParsedRecipe, recipeStructureSchema } from "@/lib/schemas";
import { handleError, ERROR_MESSAGES } from "@/lib/utils/error-handler";
import { convertToMarkdown } from "@/lib/utils/markdown";

interface RecipeState {
  // Generation State
  recipe: string; // Kept for markdown representation
  parsedRecipe: ParsedRecipe;
  structuredRecipe: RecipeStructure | null;
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
      // Initial State
      recipe: "",
      parsedRecipe: { title: "", content: "" },
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
      setMode: (mode: "specific" | "ingredients" | null) => {
        set({
          mode,
          recipe: "",
          parsedRecipe: { title: "", content: "" },
          structuredRecipe: null,
          generationError: null,
          saved: false,
        });
      },

      generateRecipeContent: async (prompt, isIngredientsMode, userProfile) => {
        set({
          isGenerating: true,
          recipe: "",
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
            if (partialObject) {
              // The AI SDK streams partial objects that progressively build toward the schema.
              // We validate with Zod to ensure type safety during streaming.
              const validationResult = recipeStructureSchema.safeParse(partialObject);
              if (!validationResult.success) {
                // Skip invalid partial updates during streaming
                // Log validation errors in development to help catch schema issues
                if (process.env.NODE_ENV === "development") {
                  console.warn(
                    "Invalid partial recipe data during streaming:",
                    validationResult.error.flatten()
                  );
                }
                continue;
              }
              
              const structuredData = validationResult.data;
              const markdownContent = convertToMarkdown(structuredData);
              const title = structuredData.title || "";

              // We need to strip the title from the markdown content for the display component
              // since RecipeDisplay renders the title separately
              const contentForDisplay = markdownContent.replace(
                /^# .*\n\n/,
                ""
              );

              set({
                structuredRecipe: structuredData,
                recipe: markdownContent,
                parsedRecipe: {
                  title,
                  content: contentForDisplay,
                  structuredData,
                },
              });
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
        const { recipe, structuredRecipe } = get();
        if (!userId) {
          set({ saveError: "You must be logged in to save recipes" });
          return;
        }

        set({ isSaving: true, saveError: null });

        try {
          await saveRecipe({
            userId,
            content: recipe,
            structuredData: structuredRecipe || undefined,
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
          recipe: "",
          parsedRecipe: { title: "", content: "" },
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
