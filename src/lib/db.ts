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
import { Recipe, UserProfile } from "./types";

export async function saveRecipe(userId: string, recipeContent: string) {
  // Extract title from the markdown content (it should be the first line starting with #)
  const titleMatch = recipeContent.match(/^# (.*)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "New Recipe";

  // Removing the title from the content to avoid duplication if needed,
  // or we can keep it. Current implementation in saveRecipe seems to store full content.
  // Let's ensure we extract fields correctly from the standardized markdown format.

  const preparationTime =
    recipeContent.match(/- Preparation Time: (.*)/)?.[1] || "";
  const cookingTime = recipeContent.match(/- Cooking Time: (.*)/)?.[1] || "";
  const servingsMatch = recipeContent.match(/- Servings: (\d+)/);
  const servings = servingsMatch ? parseInt(servingsMatch[1]) : 0;

  // Extract ingredients
  const ingredientsMatch = recipeContent.match(
    /## Ingredients\n([\s\S]*?)(?=##|$)/
  );
  const ingredients = ingredientsMatch
    ? ingredientsMatch[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.trim().replace(/^- /, ""))
    : [];

  const recipe: Omit<Recipe, "id"> = {
    userId,
    title,
    content: recipeContent,
    createdAt: Date.now(),
    ingredients,
    preparationTime,
    cookingTime,
    servings,
  };

  const docRef = await addDoc(collection(db, "recipes"), recipe);
  return { id: docRef.id, ...recipe };
}

export async function getUserRecipes(userId: string) {
  const q = query(
    collection(db, "recipes"),
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
  await deleteDoc(doc(db, "recipes", recipeId));
}

export async function saveUserProfile(
  userId: string,
  profile: Omit<UserProfile, "id">
) {
  const profileData = {
    ...profile,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "userProfiles", userId), profileData);
  return { id: userId, ...profile };
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const docRef = doc(db, "userProfiles", userId);
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
