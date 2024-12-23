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
