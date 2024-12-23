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
  // First try to find the JSON title
  let title: string | undefined;
  const jsonMatch = recipeContent.match(/^{.*}/);
  if (jsonMatch) {
    try {
      const titleObj = JSON.parse(jsonMatch[0]);
      title = titleObj.title;
      // Remove the JSON line from content
      recipeContent = recipeContent.replace(/^{.*}\n\n/, "");
    } catch (e) {
      console.error("Failed to parse title JSON:", e);
    }
  }

  // Fallback title extraction if JSON parsing fails
  if (!title) {
    title =
      recipeContent.match(
        /# Suggested Recipes\n\nBased on your ingredients, I recommend:\n\n([^\n]+)/
      )?.[1] ||
      recipeContent.match(/# Recipe Details\n([^-\n][^\n]+)/)?.[1]?.trim() ||
      "New Recipe";
  }

  const preparationTime =
    recipeContent.match(/- Preparation Time: (.*)/)?.[1] || "";
  const cookingTime = recipeContent.match(/- Cooking Time: (.*)/)?.[1] || "";
  const servings = parseInt(
    recipeContent.match(/- Servings: (\d+)/)?.[1] || "0"
  );

  // Extract ingredients
  const ingredientsMatch = recipeContent.match(
    /## Ingredients\n([\s\S]*?)(?=##)/
  );
  const ingredients = ingredientsMatch
    ? ingredientsMatch[1]
        .split("\n")
        .filter(Boolean)
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
    const data = docSnap.data();
    // Remove updatedAt from the data
    const { ...profileData } = data;
    return {
      id: docSnap.id,
      ...profileData,
    } as UserProfile;
  }
  return null;
}
