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
import { serializeFirestoreDoc } from "./utils/firestore";
import { handleError, ERROR_MESSAGES } from "./utils/error-handler";

interface SaveRecipeParams {
  userId: string;
  content: string;
  structuredData?: RecipeStructure;
}

/**
 * Saves a recipe to Firestore.
 * Uses structured data if available, otherwise falls back to parsing markdown.
 */
export async function saveRecipe({
  userId,
  content,
  structuredData,
}: SaveRecipeParams): Promise<Recipe> {
  try {
    // Use structured data if available, otherwise parse from markdown
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
    const message = handleError(
      error,
      "Failed to save recipe to Firestore",
      { userId },
      ERROR_MESSAGES.RECIPE.SAVE_FAILED
    );
    throw new Error(message);
  }
}

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
    return z.array(recipeSchema).parse(rawRecipes);
  } catch (error) {
    const message = handleError(
      error,
      "Failed to fetch user recipes from Firestore",
      { userId },
      ERROR_MESSAGES.RECIPE.LOAD_FAILED
    );
    throw new Error(message);
  }
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.RECIPES, recipeId));
  } catch (error) {
    const message = handleError(
      error,
      "Failed to delete recipe from Firestore",
      { recipeId },
      ERROR_MESSAGES.RECIPE.DELETE_FAILED
    );
    throw new Error(message);
  }
}

export async function saveUserProfile(
  userId: string,
  profile: UserProfileInput
): Promise<UserProfile> {
  try {
    const profileData = {
      ...profile,
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.USER_PROFILES, userId), profileData);
    return { id: userId, ...profile };
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
      return userProfileSchema.parse(rawProfile);
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
