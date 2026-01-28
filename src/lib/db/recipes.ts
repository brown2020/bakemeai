/**
 * Firestore database operations for recipes.
 * 
 * NAMING CONVENTIONS:
 * - get*: Synchronous or async read operations (getUserRecipes)
 * - save*: Create or update operations (saveRecipe)
 * - delete*: Deletion operations (deleteRecipe)
 * - fetch*: Reserved for client-side data fetching hooks
 * 
 * ERROR HANDLING CONTRACT:
 * - All functions throw errors on failure (never return error objects)
 * - Callers MUST use try-catch blocks
 * - Errors are logged internally before being thrown
 * - User-friendly messages are included in thrown Error objects
 * 
 * @example
 * try {
 *   const recipe = await saveRecipe({ userId, content });
 * } catch (error) {
 *   // Error already logged, message is user-friendly
 *   displayErrorToUser(error.message);
 * }
 */

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { z } from "zod";

import { db } from "../firebase";
import type {
  Recipe,
  RecipeStructure,
} from "../schemas/recipe";
import {
  recipeSchema,
  completeRecipeStructureSchema,
} from "../schemas/recipe";
import { COLLECTIONS } from "../constants/domain";
import { getFirestoreErrorMessage } from "../utils/firestore";
import { AppError, ERROR_MESSAGES } from "../utils/error-handler";
import { logError } from "../utils/logger";

interface SaveRecipeParams {
  userId: string;
  content: string;
  structuredData: RecipeStructure;
}

/**
 * Saves a recipe to Firestore.
 * Requires complete structured data from AI generation - no fallback parsing.
 * 
 * @param params - Recipe save parameters
 * @param params.userId - The user's unique identifier
 * @param params.content - Full markdown content of the recipe
 * @param params.structuredData - Structured recipe data from AI generation (required)
 * @returns The saved recipe with generated ID
 * @throws AppError if structured data is incomplete or invalid
 */
export async function saveRecipe({
  userId,
  content,
  structuredData,
}: SaveRecipeParams): Promise<Recipe> {
  try {
    // Validate that structured data is complete and valid
    const validationResult = completeRecipeStructureSchema.safeParse(structuredData);
    if (!validationResult.success) {
      logError("Invalid structured data provided to saveRecipe", new Error("Validation failed"), {
        userId,
        validationErrors: validationResult.error.flatten(),
      });
      throw new AppError(
        "Recipe data is incomplete. Please regenerate the recipe.",
        "INVALID_RECIPE_DATA",
        { userId }
      );
    }

    const recipe = {
      userId,
      title: structuredData.title,
      content,
      createdAt: serverTimestamp(),
      ingredients: structuredData.ingredients,
      preparationTime: structuredData.preparationTime,
      cookingTime: structuredData.cookingTime,
      servings: structuredData.servings,
      difficulty: structuredData.difficulty,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.RECIPES), recipe);
    // Note: createdAt will be a FieldValue here, but Firestore will convert it to Timestamp
    // The return value's createdAt is not a real Timestamp until the document is read back
    return { id: docRef.id, ...recipe } as Recipe;
  } catch (error) {
    // Re-throw AppError as-is
    if (error instanceof AppError) {
      throw error;
    }
    logError("Failed to save recipe to Firestore", error, { userId });
    const message = getFirestoreErrorMessage(error, ERROR_MESSAGES.RECIPE.SAVE_FAILED);
    throw new AppError(message, "RECIPE_SAVE_FAILED", { userId });
  }
}

/**
 * Retrieves all recipes for a specific user from Firestore.
 * Results are ordered by creation date (newest first) and validated with Zod.
 * @param userId - The user's unique identifier
 * @returns Array of user's recipes
 */
export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  try {
    const recipesQuery = query(
      collection(db, COLLECTIONS.RECIPES),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(recipesQuery);
    const rawRecipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Validate data with Zod schema
    const result = z.array(recipeSchema).safeParse(rawRecipes);
    if (!result.success) {
      logError("Recipe validation failed", new Error("Zod validation error"), {
        userId,
        validationErrors: result.error.flatten(),
      });
      throw new AppError("Invalid recipe data from Firestore", "INVALID_RECIPE_DATA");
    }
    return result.data;
  } catch (error) {
    logError("Failed to fetch user recipes from Firestore", error, { userId });
    const message = getFirestoreErrorMessage(error, ERROR_MESSAGES.RECIPE.LOAD_FAILED);
    throw new AppError(message, "RECIPE_LOAD_FAILED", { userId });
  }
}

/**
 * Deletes a recipe from Firestore.
 * @param recipeId - The recipe's unique identifier
 */
export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.RECIPES, recipeId));
  } catch (error) {
    logError("Failed to delete recipe from Firestore", error, { recipeId });
    const message = getFirestoreErrorMessage(error, ERROR_MESSAGES.RECIPE.DELETE_FAILED);
    throw new AppError(message, "RECIPE_DELETE_FAILED", { recipeId });
  }
}
