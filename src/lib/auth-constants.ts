// Server-safe constants shared by middleware/proxy and client auth helpers.
// IMPORTANT: This must be namespaced to avoid collisions across multiple apps on `localhost`.
export const FIREBASE_AUTH_COOKIE = "bakemeai_firebaseAuth";

// Legacy cookie name used previously; keep clearing it to avoid stale auth.
export const LEGACY_FIREBASE_AUTH_COOKIE = "firebaseAuth";


