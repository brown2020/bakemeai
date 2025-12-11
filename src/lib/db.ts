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
import { Recipe, UserProfile, RecipeStructure } from "./types";
import { COLLECTIONS } from "./constants";

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
}: SaveRecipeParams) {
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
}

export async function getUserRecipes(userId: string) {
  const q = query(
    collection(db, COLLECTIONS.RECIPES),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Recipe[];
}

export async function deleteRecipe(recipeId: string) {
  await deleteDoc(doc(db, COLLECTIONS.RECIPES, recipeId));
}

export async function saveUserProfile(
  userId: string,
  profile: Omit<UserProfile, "id">
) {
  const profileData = {
    ...profile,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, COLLECTIONS.USER_PROFILES, userId), profileData);
  return { id: userId, ...profile };
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const docRef = doc(db, COLLECTIONS.USER_PROFILES, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { updatedAt, ...profileData } = docSnap.data();
    return {
      id: docSnap.id,
      ...profileData,
    } as UserProfile;
  }
  return null;
}

// Helper functions for parsing markdown (fallback when structured data unavailable)
function extractTitle(content: string): string {
  const match = content.match(/^# (.*)$/m);
  return match ? match[1].trim() : "New Recipe";
}

function extractIngredients(content: string): string[] {
  const match = content.match(/## Ingredients\n([\s\S]*?)(?=##|$)/);
  if (!match) return [];
  return match[1]
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.trim().replace(/^- /, ""));
}

function extractField(content: string, fieldName: string): string {
  const match = content.match(new RegExp(`- ${fieldName}: (.*)`));
  return match?.[1] || "";
}

function extractServings(content: string): number {
  const match = content.match(/- Servings: (\d+)/);
  return match ? parseInt(match[1]) : 0;
}
