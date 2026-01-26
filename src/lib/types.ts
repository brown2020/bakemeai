/**
 * Re-export types from schemas.ts for backwards compatibility.
 * All types are now defined with Zod schemas for runtime validation.
 */
import type { RecipeStructure as RecipeStructureType } from "./schemas";

export type {
  Recipe,
  UserProfile,
  UserProfileInput,
  RecipeStructure,
} from "./schemas";

export interface ParsedRecipe {
  title: string;
  content: string;
  structuredData?: RecipeStructureType;
}
