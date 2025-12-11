/**
 * Centralized constants for the application.
 * Keeps all configuration in one place for easier maintenance.
 */

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

/**
 * Private routes that require authentication.
 * Used by middleware for route protection.
 */
export const PRIVATE_ROUTES = ["/generate", "/profile", "/saved"] as const;
