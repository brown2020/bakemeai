/**
 * Firestore database operations barrel export.
 * Provides a unified import point for all database operations.
 */

export {
  saveRecipe,
  getUserRecipes,
  deleteRecipe,
} from "./recipes";

export {
  saveUserProfile,
  getUserProfile,
} from "./profiles";
