import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  dietary: string[];
  allergies: string[];
  dislikedIngredients: string[];
  cookingExperience: "beginner" | "intermediate" | "advanced";
  servingSize: number;
  preferredCuisines: string[];
  updatedAt?: Timestamp;
  updatedAtString?: string;
}

/**
 * Input shape used for creating/updating a profile in Firestore.
 * Excludes server-derived fields like `id` and timestamp/string variants.
 */
export type UserProfileInput = Omit<
  UserProfile,
  "id" | "updatedAt" | "updatedAtString"
>;

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: number;
  ingredients: string[];
  preparationTime: string;
  cookingTime: string;
  servings: number;
  cuisine?: string;
  difficulty?: string;
}

export interface RecipeStructure {
  title?: string;
  preparationTime?: string;
  cookingTime?: string;
  servings?: number;
  difficulty?: "Easy" | "Moderate" | "Advanced";
  ingredients?: string[];
  instructions?: string[];
  tips?: string[];
  calories?: number | null;
  macros?: {
    protein: string | null;
    carbs: string | null;
    fat: string | null;
  } | null;
}

export interface ParsedRecipe {
  title: string;
  content: string;
  structuredData?: RecipeStructure;
}
