/**
 * Application domain constants.
 * Keeps all non-auth configuration in one place for easier maintenance.
 * 
 * Organization:
 * - UI constants: Timing, layout, validation rules (re-exported)
 * - Database: Firestore collection names
 * - Domain: Dietary options, cuisines, experience levels
 * 
 * Note: Authentication constants are in auth-constants.ts
 */

// Re-export UI constants for convenience
export * from "./constants/ui";

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

