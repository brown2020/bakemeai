/**
 * Authentication constants.
 * 
 * These constants are used in both server (Edge runtime) and client contexts,
 * so they must not depend on Node.js or browser-specific APIs.
 * 
 * Organization:
 * - Cookie names: Current and legacy Firebase auth cookies
 * - Routes: Protected routes and auth pages for proxy.ts
 * - Configuration: Cookie expiry and JWT validation settings
 */

/**
 * Authentication cookie names.
 * 
 * TEMPORAL RELATIONSHIP:
 * - CURRENT: The active cookie name used for new sessions (namespaced)
 * - LEGACY: Previous cookie name from older versions (global, not namespaced)
 * 
 * Both are cleared during logout to prevent stale auth from old sessions.
 */

/**
 * Current authentication cookie name (active).
 * 
 * Value: "bakemeai_firebaseAuth"
 * Namespaced to avoid collisions across multiple apps on localhost.
 * Format: {appname}_firebaseAuth
 * 
 * Use this for all new authentication operations.
 */
export const FIREBASE_AUTH_COOKIE = "bakemeai_firebaseAuth" as const;

/**
 * Legacy authentication cookie name (deprecated, cleanup only).
 * 
 * Value: "firebaseAuth"  
 * Used in previous versions before namespacing was added.
 * Not namespaced - can conflict with other apps on localhost.
 * 
 * Do NOT use for new operations. Only cleared during logout for cleanup.
 */
export const LEGACY_FIREBASE_AUTH_COOKIE = "firebaseAuth" as const;

/**
 * Private routes that require authentication.
 * Used by proxy.ts for route protection.
 */
export const PRIVATE_ROUTES = ["/generate", "/profile", "/saved"] as const;

/**
 * Public authentication pages.
 * These pages should be accessible when logged out and redirect away when logged in.
 */
export const AUTH_PAGES = ["/login", "/signup", "/reset-password"] as const;

/**
 * Cookie configuration for client-side auth token storage.
 */
export const COOKIE_CONFIG = {
  /** Cookie expiry in days */
  EXPIRY_DAYS: 7,
} as const;

/**
 * JWT validation configuration for server-side token verification.
 */
export const JWT_VALIDATION_CONFIG = {
  /** Leeway in seconds to account for clock skew when validating JWT expiry */
  EXPIRY_LEEWAY_SECONDS: 5,
} as const;
