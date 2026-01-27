/**
 * Firestore database operations for recipes and user profiles.
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
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { z } from "zod";

import { db } from "./firebase";
import {
  Recipe,
  UserProfile,
  RecipeStructure,
  CompleteRecipeStructure,
  UserProfileInput,
  recipeSchema,
  userProfileSchema,
  completeRecipeStructureSchema,
} from "./schemas";
import { COLLECTIONS } from "./constants/domain";
import {
  extractTitle,
  extractIngredients,
  extractField,
  extractServings,
} from "./utils/markdown-parser";
import { getFirestoreErrorMessage } from "./utils/firestore";
import { AppError, ERROR_MESSAGES } from "./utils/error-handler";
import { sanitizeUserInput } from "./utils/sanitize";
import { logError } from "./utils/logger";

interface SaveRecipeParams {
  userId: string;
  content: string;
  structuredData?: RecipeStructure;
}

/**
 * Saves a recipe to Firestore.
 * Uses structured data if available, otherwise falls back to parsing markdown.
 * 
 * Strategy:
 * 1. Prefer structured data from AI (more reliable)
 * 2. Fall back to markdown parsing if structured data is missing
 * 3. Store both structured metadata and full markdown content
 * 
 * @param params - Recipe save parameters
 * @param params.userId - The user's unique identifier
 * @param params.content - Full markdown content of the recipe
 * @param params.structuredData - Optional structured recipe data from AI generation
 * @returns The saved recipe with generated ID
 */
/**
 * Checks if structured data is complete and valid.
 */
function hasCompleteStructuredData(data?: RecipeStructure): data is CompleteRecipeStructure {
  if (!data) return false;
  return completeRecipeStructureSchema.safeParse(data).success;
}

export async function saveRecipe({
  userId,
  content,
  structuredData,
}: SaveRecipeParams): Promise<Recipe> {
  try {
    const useStructured = hasCompleteStructuredData(structuredData);

    const title = useStructured 
      ? structuredData.title 
      : extractTitle(content);
    const ingredients = useStructured
      ? structuredData.ingredients
      : extractIngredients(content);
    const preparationTime = useStructured
      ? structuredData.preparationTime
      : extractField(content, "Preparation Time");
    const cookingTime = useStructured
      ? structuredData.cookingTime
      : extractField(content, "Cooking Time");
    const servings = useStructured 
      ? structuredData.servings 
      : extractServings(content);
    const difficulty = structuredData?.difficulty;

    const recipe: Omit<Recipe, "id"> = {
      userId,
      title,
      content,
      createdAt: Date.now(),
      ingredients,
      preparationTime,
      cookingTime,
      servings,
      difficulty,
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.RECIPES), recipe);
    return { id: docRef.id, ...recipe };
  } catch (error) {
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

/**
 * Saves or updates a user profile in Firestore.
 * @param userId - The user's unique identifier
 * @param profile - The profile data to save
 */
export async function saveUserProfile(
  userId: string,
  profile: UserProfileInput
): Promise<void> {
  try {
    // Sanitize user-input arrays to prevent HTML injection in stored data
    const sanitizedProfile = {
      ...profile,
      allergies: profile.allergies.map(sanitizeUserInput),
      dislikedIngredients: profile.dislikedIngredients.map(sanitizeUserInput),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.USER_PROFILES, userId), sanitizedProfile);
  } catch (error) {
    logError("Failed to save user profile to Firestore", error, { userId });
    throw new AppError(ERROR_MESSAGES.PROFILE.SAVE_FAILED, "PROFILE_SAVE_FAILED", { userId });
  }
}

/**
 * Retrieves a user profile from Firestore.
 * @param userId - The user's unique identifier
 * @returns The user profile or null if not found
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const rawProfile = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      // Validate data with Zod schema
      const result = userProfileSchema.safeParse(rawProfile);
      if (!result.success) {
        throw new AppError("Invalid profile data from Firestore", "INVALID_PROFILE_DATA");
      }
      return result.data;
    }
    return null;
  } catch (error) {
    logError("Failed to fetch user profile from Firestore", error, { userId });
    throw new AppError(ERROR_MESSAGES.PROFILE.LOAD_FAILED, "PROFILE_LOAD_FAILED", { userId });
  }
}
