/**
 * Centralized constants for the application.
 * Keeps all configuration in one place for easier maintenance.
 */

// Re-export UI constants for convenience
export * from "./constants/ui";

// Firestore collection names
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

/**
 * Private routes that require authentication.
 * Used by middleware for route protection.
 */
export const PRIVATE_ROUTES = ["/generate", "/profile", "/saved"] as const;

/**
 * Public authentication pages.
 * These pages should be accessible when logged out and redirect away when logged in.
 */
export const AUTH_PAGES = ["/login", "/signup", "/reset-password"] as const;

/**
 * Authentication cookie configuration.
 */
export const AUTH_COOKIE_CONFIG = {
  /** Cookie expiry in days */
  EXPIRY_DAYS: 7,
  /** Leeway in seconds to account for clock skew when validating JWT expiry */
  JWT_EXPIRY_LEEWAY_SECONDS: 5,
} as const;

