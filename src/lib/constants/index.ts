/**
 * Constants barrel export.
 * Provides a unified import point for all application constants.
 * 
 * Organization:
 * - auth.ts: Authentication, security, and route protection
 * - domain.ts: Business domain data (collections, dietary options, cuisines)
 * - ui.ts: UI behavior (timing, validation, layout)
 * 
 * Usage:
 * - Import from specific files for better tree-shaking: import { PRIVATE_ROUTES } from "@/lib/constants/auth"
 * - Import from barrel for convenience: import { PRIVATE_ROUTES, UI_TIMING } from "@/lib/constants"
 * 
 * Recommendation: Use specific imports in production code, barrel import in tests/utilities.
 */

export * from "./auth";
export * from "./domain";
export * from "./ui";
