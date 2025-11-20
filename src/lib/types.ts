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
  calories?: number;
  macros?: {
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

export interface ParsedRecipe {
  title: string;
  content: string;
  structuredData?: RecipeStructure;
}
