/**
 * Application constants - centralized exports.
 * 
 * Organization:
 * - auth.ts: Authentication (cookies, routes, JWT config)
 * - domain.ts: Business domain (collections, dietary options, cuisines)
 * - ui.ts: UI behavior (validation, timing, layout, recipe display)
 * 
 * Import from this index for convenience or from specific files for clarity.
 */

// Authentication constants
export {
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
  PRIVATE_ROUTES,
  AUTH_PAGES,
  COOKIE_CONFIG,
  JWT_VALIDATION_CONFIG,
} from "./auth";

// Domain constants
export {
  COLLECTIONS,
  DIETARY_OPTIONS,
  CUISINE_OPTIONS,
  EXPERIENCE_LEVELS,
  type CookingExperience,
} from "./domain";

// UI constants
export {
  FORM_VALIDATION,
  UI_TIMING,
  NUMBER_INPUT,
  LAYOUT,
  RECIPE,
} from "./ui";
