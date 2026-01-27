import { db } from "./firebase";
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
import {
  Recipe,
  UserProfile,
  RecipeStructure,
  UserProfileInput,
  recipeSchema,
  userProfileSchema,
} from "./schemas";
import { COLLECTIONS } from "./constants";
import { z } from "zod";
import {
  extractTitle,
  extractIngredients,
  extractField,
  extractServings,
} from "./utils/markdown";
import { serializeFirestoreDoc, getFirestoreErrorMessage } from "./utils/firestore";
import { handleError, ERROR_MESSAGES } from "./utils/error-handler";
import { sanitizeUserInput } from "./utils/sanitize";

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
export async function saveRecipe({
  userId,
  content,
  structuredData,
}: SaveRecipeParams): Promise<Recipe> {
  try {
    // Extract metadata: prefer structured data from AI, fall back to markdown parsing
    const title = structuredData?.title || extractTitle(content);
    const ingredients =
      structuredData?.ingredients || extractIngredients(content);
    const preparationTime =
      structuredData?.preparationTime ||
      extractField(content, "Preparation Time");
    const cookingTime =
      structuredData?.cookingTime || extractField(content, "Cooking Time");
    const servings = structuredData?.servings || extractServings(content);
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
    const userMessage = getFirestoreErrorMessage(error, ERROR_MESSAGES.RECIPE.SAVE_FAILED);
    const message = handleError(
      error,
      "Failed to save recipe to Firestore",
      { userId },
      userMessage
    );
    throw new Error(message);
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
    const q = query(
      collection(db, COLLECTIONS.RECIPES),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const rawRecipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Validate data with Zod schema
    const result = z.array(recipeSchema).safeParse(rawRecipes);
    if (!result.success) {
      throw new Error("Invalid recipe data from Firestore");
    }
    return result.data;
  } catch (error) {
    const userMessage = getFirestoreErrorMessage(error, ERROR_MESSAGES.RECIPE.LOAD_FAILED);
    const message = handleError(
      error,
      "Failed to fetch user recipes from Firestore",
      { userId },
      userMessage
    );
    throw new Error(message);
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
    const userMessage = getFirestoreErrorMessage(error, ERROR_MESSAGES.RECIPE.DELETE_FAILED);
    const message = handleError(
      error,
      "Failed to delete recipe from Firestore",
      { recipeId },
      userMessage
    );
    throw new Error(message);
  }
}

/**
 * Saves or updates a user profile in Firestore.
 * @param userId - The user's unique identifier
 * @param profile - The profile data to save
 * @returns The saved profile
 */
export async function saveUserProfile(
  userId: string,
  profile: UserProfileInput
): Promise<UserProfile> {
  try {
    // Sanitize user-input arrays to prevent HTML injection in stored data
    const sanitizedProfile = {
      ...profile,
      allergies: profile.allergies.map(sanitizeUserInput),
      dislikedIngredients: profile.dislikedIngredients.map(sanitizeUserInput),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.USER_PROFILES, userId), sanitizedProfile);
    return { 
      id: userId, 
      ...profile,
      allergies: sanitizedProfile.allergies,
      dislikedIngredients: sanitizedProfile.dislikedIngredients,
      updatedAt: sanitizedProfile.updatedAt as unknown as Timestamp,
    };
  } catch (error) {
    const message = handleError(
      error,
      "Failed to save user profile to Firestore",
      { userId },
      ERROR_MESSAGES.PROFILE.SAVE_FAILED
    );
    throw new Error(message);
  }
}

/**
 * Retrieves a user profile from Firestore.
 * Serializes Firestore Timestamps to ISO strings for client-side compatibility.
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
      const rawProfile = serializeFirestoreDoc({
        id: docSnap.id,
        ...docSnap.data(),
      });

      // Validate data with Zod schema
      const result = userProfileSchema.safeParse(rawProfile);
      if (!result.success) {
        throw new Error("Invalid profile data from Firestore");
      }
      return result.data;
    }
    return null;
  } catch (error) {
    const message = handleError(
      error,
      "Failed to fetch user profile from Firestore",
      { userId },
      ERROR_MESSAGES.PROFILE.LOAD_FAILED
    );
    throw new Error(message);
  }
}
