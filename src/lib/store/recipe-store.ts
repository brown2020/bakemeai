import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateRecipe } from "@/lib/actions";
import { readStreamableValue } from "@ai-sdk/rsc";
import { saveRecipe } from "@/lib/db";
import { UserProfile, RecipeStructure, recipeStructureSchema } from "@/lib/schemas";
import { ParsedRecipe } from "@/lib/types";
import { handleError, ERROR_MESSAGES } from "@/lib/utils/error-handler";

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
    userProfile: UserProfile | null
  ) => Promise<void>;
  saveRecipeToDb: (userId: string) => Promise<void>;
  resetRecipe: () => void;
  resetSaveState: () => void;
}

/**
 * Converts a structured recipe object to markdown format.
 * Uses useMemo-compatible pure function for optimal performance.
 */
function convertToMarkdown(recipe: RecipeStructure): string {
  if (!recipe.title) return "";

  let md = `# ${recipe.title}\n\n`;

  md += `# Recipe Details\n`;
  if (recipe.preparationTime)
    md += `- Preparation Time: ${recipe.preparationTime}\n`;
  if (recipe.cookingTime) md += `- Cooking Time: ${recipe.cookingTime}\n`;
  if (recipe.servings) md += `- Servings: ${recipe.servings}\n`;
  if (recipe.difficulty) md += `- Difficulty: ${recipe.difficulty}\n`;
  if (recipe.calories != null) md += `- Calories: ${recipe.calories} kcal\n`;

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    md += `\n## Ingredients\n`;
    recipe.ingredients.forEach((ing) => {
      md += `- ${ing}\n`;
    });
  }

  if (recipe.instructions && recipe.instructions.length > 0) {
    md += `\n## Instructions\n`;
    recipe.instructions.forEach((step, index) => {
      md += `${index + 1}. ${step}\n`;
    });
  }

  if (recipe.tips && recipe.tips.length > 0) {
    md += `\n## Tips\n`;
    recipe.tips.forEach((tip) => {
      md += `- ${tip}\n`;
    });
  }

  return md;
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

      setInput: (input: string): void => {
        set({ input });
      },
      setIngredients: (ingredients: string): void => {
        set({ ingredients });
      },
      setMode: (mode: "specific" | "ingredients" | null): void => {
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

      resetRecipe: (): void => {
        set({
          recipe: "",
          parsedRecipe: { title: "", content: "" },
          structuredRecipe: null,
          generationError: null,
          saved: false,
          saveError: null,
        });
      },

      resetSaveState: (): void => {
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
