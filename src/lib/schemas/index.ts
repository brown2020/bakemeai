/**
 * Schema exports - centralized re-exports from organized schema files.
 * 
 * Organization:
 * - recipe.ts: Recipe schemas and types
 * - user.ts: User profile schemas and types
 * - validation.ts: Form and input validation schemas
 */

// Recipe schemas and types
export {
  recipeSchema,
  recipeStructureSchema,
  completeRecipeStructureSchema,
  aiRecipeFields,
  type Recipe,
  type RecipeStructure,
  type CompleteRecipeStructure,
  type ParsedRecipe,
} from "./recipe";

// User profile schemas and types
export {
  userProfileSchema,
  serializableUserProfileSchema,
  userProfileInputSchema,
  type UserProfile,
  type SerializableUserProfile,
  type UserProfileInput,
} from "./user";

// Validation schemas
export {
  emailSchema,
  passwordSchema,
  specificRecipeInputSchema,
  ingredientsRecipeInputSchema,
} from "./validation";
