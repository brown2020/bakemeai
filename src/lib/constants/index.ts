/**
 * Application constants - centralized exports.
 * 
 * Organization by domain:
 * 
 * auth.ts - Authentication & Security
 *   - Cookie names and configuration
 *   - Route protection (private routes, auth pages)
 *   - JWT validation settings
 * 
 * domain.ts - Business Domain
 *   - Firestore collection names
 *   - Dietary preferences and restrictions
 *   - Cuisine types and cooking experience levels
 * 
 * ui.ts - User Interface Behavior
 *   - Form validation rules (lengths, thresholds)
 *   - Timing constants (debounce, transitions, messages)
 *   - Number input constraints (min/max, defaults)
 *   - Layout dimensions and spacing
 *   - Recipe display settings
 * 
 * Pattern: All constants use `as const` for type safety and immutability.
 * This ensures TypeScript treats values as literal types and prevents modification.
 * 
 * Import patterns:
 *   - From index: `import { COLLECTIONS } from '@/lib/constants'`
 *   - From specific file: `import { COLLECTIONS } from '@/lib/constants/domain'`
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
