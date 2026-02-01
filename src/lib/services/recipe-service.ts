/**
 * Recipe business logic service.
 * Separates business operations from state management.
 */

import { generateRecipe } from "@/lib/recipe-generation.server";
import { readStreamableValue } from "@ai-sdk/rsc";
import { saveRecipe as saveRecipeToDb, deleteRecipe as deleteRecipeFromDb } from "@/lib/db";
import type { SerializableUserProfile } from "@/lib/schemas/user";
import type { RecipeStructure } from "@/lib/schemas/recipe";
import { recipeStructureSchema, completeRecipeStructureSchema } from "@/lib/schemas/recipe";
import { AppError, ERROR_MESSAGES, convertErrorToMessage } from "@/lib/utils/error-handler";
import { convertToMarkdown } from "@/lib/utils/markdown";
import { logError, logWarning } from "@/lib/utils/logger";

/**
 * Generates a recipe using AI and streams partial updates.
 * Supports cancellation via AbortSignal to prevent race conditions
 * when multiple generations are triggered rapidly.
 *
 * @param prompt - The recipe generation prompt
 * @param isIngredientsMode - Whether generating from ingredients or specific dish
 * @param userProfile - User preferences for personalization
 * @param onPartialUpdate - Callback for each streaming update
 * @param onError - Callback for errors
 * @param signal - Optional AbortSignal for cancellation
 * @returns Promise that resolves when generation completes or is aborted
 */
export async function generateRecipeWithStreaming(
  prompt: string,
  isIngredientsMode: boolean,
  userProfile: SerializableUserProfile | null,
  onPartialUpdate: (recipe: RecipeStructure) => void,
  onError: (errorMessage: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    // Check if already aborted before starting
    if (signal?.aborted) return;

    const result = await generateRecipe(prompt, isIngredientsMode, userProfile);

    for await (const partialObject of readStreamableValue(result)) {
      // Check for abort before processing each chunk
      if (signal?.aborted) return;

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
    // Don't report errors for aborted requests
    if (signal?.aborted) return;

    logError("Error generating recipe", error, {});
    const message = convertErrorToMessage(error, ERROR_MESSAGES.RECIPE.GENERATION_FAILED);
    onError(message);
  }
}

/**
 * Saves a recipe to the database.
 * Validates recipe completeness before saving to prevent malformed AI output from being persisted.
 * @param userId - User ID
 * @param structuredRecipe - Recipe data to save
 * @returns Promise that resolves when save completes
 * @throws AppError if recipe validation fails or save operation fails
 */
export async function saveRecipeToDatabase(
  userId: string,
  structuredRecipe: RecipeStructure
): Promise<void> {
  // Validate that recipe has all required fields before saving
  const validationResult = completeRecipeStructureSchema.safeParse(structuredRecipe);
  if (!validationResult.success) {
    logError("Recipe validation failed before save", new Error("Incomplete recipe data"), {
      userId,
      validationErrors: validationResult.error.flatten(),
    });
    throw new AppError(
      "Recipe is incomplete and cannot be saved. Please regenerate the recipe.",
      "RECIPE_VALIDATION_FAILED",
      { userId }
    );
  }

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
    logError("Error saving recipe to database", error, { userId });
    const message = convertErrorToMessage(error, ERROR_MESSAGES.RECIPE.SAVE_FAILED);
    throw new AppError(message, "RECIPE_SAVE_FAILED", { userId });
  }
}

/**
 * Deletes a recipe from the database.
 * Service layer wrapper providing consistent error handling and logging.
 *
 * @param recipeId - Recipe ID to delete
 * @throws AppError on failure
 */
export async function deleteRecipeFromDatabase(recipeId: string): Promise<void> {
  try {
    await deleteRecipeFromDb(recipeId);
  } catch (error) {
    // Re-throw if it's already an AppError from db layer
    if (error instanceof AppError) {
      throw error;
    }
    // Otherwise wrap in AppError
    logError("Error deleting recipe from database", error, { recipeId });
    const message = convertErrorToMessage(error, ERROR_MESSAGES.RECIPE.DELETE_FAILED);
    throw new AppError(message, "RECIPE_DELETE_FAILED", { recipeId });
  }
}
