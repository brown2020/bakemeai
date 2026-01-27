/**
 * Server-safe authentication constants.
 * Shared by proxy/middleware and client auth helpers.
 * 
 * These constants are used in both server (Edge runtime) and client contexts,
 * so they must not depend on Node.js or browser-specific APIs.
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
