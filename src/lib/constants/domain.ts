/**
 * Domain-specific constants for the application.
 * 
 * Organization:
 * - Database: Firestore collection names
 * - Dietary: Dietary options and preferences
 * - Cuisines: Available cuisine types
 * - Experience: Cooking experience levels
 */

/**
 * Firestore collection names.
 * Using const assertion for type safety and immutability.
 */
export const COLLECTIONS = {
  RECIPES: "recipes",
  USER_PROFILES: "userProfiles",
} as const;

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-free",
  "Dairy-free",
  "Keto",
  "Paleo",
] as const;

export const CUISINE_OPTIONS = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "Thai",
  "Mediterranean",
  "American",
  "French",
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export type CookingExperience = (typeof EXPERIENCE_LEVELS)[number]["value"];
