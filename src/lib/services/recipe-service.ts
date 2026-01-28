/**
 * Recipe business logic service.
 * Separates business operations from state management.
 */

import { generateRecipe } from "@/lib/recipe-generation.server";
import { readStreamableValue } from "@ai-sdk/rsc";
import { saveRecipe as saveRecipeToDb } from "@/lib/db";
import { SerializableUserProfile } from "@/lib/schemas/user";
import { RecipeStructure, recipeStructureSchema } from "@/lib/schemas/recipe";
import { AppError, ERROR_MESSAGES, logAndConvertError } from "@/lib/utils/error-handler";
import { convertToMarkdown } from "@/lib/utils/markdown";
import { logWarning } from "@/lib/utils/logger";

/**
 * Generates a recipe using AI and streams partial updates.
 * @param prompt - The recipe generation prompt
 * @param isIngredientsMode - Whether generating from ingredients or specific dish
 * @param userProfile - User preferences for personalization
 * @param onPartialUpdate - Callback for each streaming update
 * @param onError - Callback for errors
 * @returns Promise that resolves when generation completes
 */
export async function generateRecipeWithStreaming(
  prompt: string,
  isIngredientsMode: boolean,
  userProfile: SerializableUserProfile | null,
  onPartialUpdate: (recipe: RecipeStructure) => void,
  onError: (errorMessage: string) => void
): Promise<void> {
  try {
    const result = await generateRecipe(prompt, isIngredientsMode, userProfile);

    for await (const partialObject of readStreamableValue(result)) {
      if (partialObject != null) {
        const validationResult = recipeStructureSchema.safeParse(partialObject);
        if (!validationResult.success) {
          logWarning("Invalid partial recipe data during streaming", {
            errors: validationResult.error.flatten(),
          });
          continue;
        }
        
        onPartialUpdate(validationResult.data);
      }
    }
  } catch (error) {
    const message = logAndConvertError(
      error,
      "Error generating recipe",
      {},
      ERROR_MESSAGES.RECIPE.GENERATION_FAILED
    );
    onError(message);
  }
}

/**
 * Saves a recipe to the database.
 * @param userId - User ID
 * @param structuredRecipe - Recipe data to save
 * @returns Promise that resolves when save completes
 */
export async function saveRecipeToDatabase(
  userId: string,
  structuredRecipe: RecipeStructure
): Promise<void> {
  const markdown = convertToMarkdown(structuredRecipe);
  
  try {
    await saveRecipeToDb({
      userId,
      content: markdown,
      structuredData: structuredRecipe,
    });
  } catch (error) {
    // Re-throw if it's already an AppError from db layer
    if (error instanceof AppError) {
      throw error;
    }
    // Otherwise wrap in AppError
    const message = logAndConvertError(
      error,
      "Error saving recipe to database",
      { userId },
      ERROR_MESSAGES.RECIPE.SAVE_FAILED
    );
    throw new AppError(message, "RECIPE_SAVE_FAILED", { userId });
  }
}
