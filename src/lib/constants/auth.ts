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
 * Current authentication cookie name.
 * 
 * IMPORTANT: Namespaced to avoid collisions across multiple apps on `localhost`.
 * Format: {appname}_firebaseAuth
 */
export const FIREBASE_AUTH_COOKIE = "bakemeai_firebaseAuth" as const;

/**
 * Legacy authentication cookie name.
 * 
 * Used in previous versions of the app. We continue to clear this cookie
 * during logout to prevent stale authentication from old sessions.
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
 * Authentication cookie configuration.
 */
export const AUTH_COOKIE_CONFIG = {
  /** Cookie expiry in days */
  EXPIRY_DAYS: 7,
  /** Leeway in seconds to account for clock skew when validating JWT expiry */
  JWT_EXPIRY_LEEWAY_SECONDS: 5,
} as const;
