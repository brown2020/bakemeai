/**
 * Standardized error handling utilities.
 * Provides consistent error messages and logging across the application.
 */

export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Base application error type with optional error code and context.
 * Provides richer error information for debugging and handling.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Type guard to check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Standard error messages for common operations.
 * Centralized to ensure consistent user experience.
 *
 * USAGE GUIDELINES:
 * - ALL user-facing error messages MUST be defined here
 * - Inline error strings are ONLY allowed for:
 *   1. Developer/debug logs (not shown to users)
 *   2. Technical error details in console
 * - Keep messages friendly, actionable, and non-technical
 * - Use ERROR_MESSAGES.* constants in UI components and hooks
 *
 * These are user-facing messages - keep them friendly and actionable.
 */
export const ERROR_MESSAGES = {
  RECIPE: {
    SAVE_FAILED: "Unable to save recipe. Please try again.",
    LOAD_FAILED: "Unable to load recipes. Please try again.",
    DELETE_FAILED: "Unable to delete recipe. Please try again.",
    GENERATION_FAILED: "Failed to generate recipe. Please try again.",
    GENERATION_UNAVAILABLE:
      "Recipe generation is temporarily unavailable. Please try again later.",
    NO_RECIPE_TO_SAVE: "No recipe to save. Please generate a recipe first.",
    RATE_LIMIT: "Please wait a moment before generating another recipe.",
  },
  PROFILE: {
    SAVE_FAILED: "Unable to save profile. Please try again.",
    LOAD_FAILED: "Unable to load profile. Please try again.",
  },
  AUTH: {
    SIGN_IN_FAILED: "Sign in failed. Please try again.",
    SIGN_OUT_FAILED: "Sign out failed. Please try again.",
    GENERIC: "An authentication error occurred.",
    LOGIN_REQUIRED: "You must be logged in to continue.",
    INVALID_CREDENTIAL: "Invalid email or password. Please try again.",
    USER_NOT_FOUND: "No account found with this email address.",
    WRONG_PASSWORD: "Incorrect password. Please try again.",
    EMAIL_IN_USE: "An account with this email already exists.",
    WEAK_PASSWORD: "Password should be at least 6 characters.",
    TOO_MANY_REQUESTS: "Too many failed attempts. Please try again later.",
    USER_DISABLED: "This account has been disabled.",
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
  },
  GENERIC: {
    UNKNOWN: "An unexpected error occurred. Please try again.",
    NETWORK: "Network error. Please check your connection.",
  },
} as const;

/**
 * Firebase error code to user-friendly message mapping.
 * Maps Firebase auth error codes to specific user-friendly messages.
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": ERROR_MESSAGES.AUTH.INVALID_CREDENTIAL,
  "auth/user-not-found": ERROR_MESSAGES.AUTH.USER_NOT_FOUND,
  "auth/wrong-password": ERROR_MESSAGES.AUTH.WRONG_PASSWORD,
  "auth/email-already-in-use": ERROR_MESSAGES.AUTH.EMAIL_IN_USE,
  "auth/weak-password": ERROR_MESSAGES.AUTH.WEAK_PASSWORD,
  "auth/too-many-requests": ERROR_MESSAGES.AUTH.TOO_MANY_REQUESTS,
  "auth/user-disabled": ERROR_MESSAGES.AUTH.USER_DISABLED,
  "auth/network-request-failed": ERROR_MESSAGES.AUTH.NETWORK_ERROR,
};

const RECIPE_PROVIDER_ERROR_CODES = new Set([
  "invalid_api_key",
  "insufficient_quota",
  "rate_limit_exceeded",
  "OPENAI_API_KEY_MISSING",
  "RECIPE_PROVIDER_ERROR",
]);

const RECIPE_PROVIDER_ERROR_PATTERN =
  /api key|authentication|unauthorized|invalid_api_key|incorrect api key|quota|rate limit/i;

/**
 * Extracts a stable error code from Firebase, provider, and AppError-like
 * errors without exposing raw error messages to users.
 */
export function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return undefined;
  }

  const code = (error as { code: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined;
  }

  const status = (error as { status: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error ?? "");
}

/**
 * Returns true for expected Firebase Auth failures that should be shown inline
 * without triggering noisy development error overlays.
 */
export function isKnownFirebaseAuthError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code ? code in FIREBASE_ERROR_MESSAGES : false;
}

function isRecipeProviderError(error: unknown): boolean {
  const code = getErrorCode(error);
  if (code && RECIPE_PROVIDER_ERROR_CODES.has(code)) return true;

  const status = getErrorStatus(error);
  if (status === 401 || status === 403 || status === 429) return true;

  return RECIPE_PROVIDER_ERROR_PATTERN.test(getErrorMessage(error));
}

/**
 * Converts an error to a user-friendly message.
 * Handles Firebase auth errors, AppErrors, and generic errors.
 *
 * @param error - The error to convert
 * @param fallbackMessage - The user-friendly message to show if error doesn't have one
 * @returns User-friendly error message suitable for display
 */
export function convertErrorToMessage(
  error: unknown,
  fallbackMessage: string
): string {
  // Handle Firebase errors with error codes
  const errorCode = getErrorCode(error);
  if (errorCode) {
    const firebaseMessage = FIREBASE_ERROR_MESSAGES[errorCode];
    if (firebaseMessage) {
      return firebaseMessage;
    }
  }

  // Convert to typed error for consistent handling
  let typedError: Error | AppError;
  if (error instanceof Error) {
    typedError = error;
  } else if (error && typeof error === "object" && "message" in error) {
    typedError = new Error(String((error as { message: unknown }).message));
  } else {
    typedError = new Error(String(error));
  }

  // If it's an AppError with a user-friendly message, prefer that
  if (isAppError(typedError) && typedError.message) {
    return typedError.message;
  }

  return fallbackMessage;
}

/**
 * Converts OpenAI/provider failures into a recipe-specific user message.
 * Provider auth/config/quota details are intentionally hidden from users.
 */
export function convertRecipeGenerationErrorToMessage(error: unknown): string {
  const message = getErrorMessage(error);
  if (message === ERROR_MESSAGES.RECIPE.GENERATION_UNAVAILABLE) {
    return message;
  }

  if (isRecipeProviderError(error)) {
    return ERROR_MESSAGES.RECIPE.GENERATION_UNAVAILABLE;
  }

  return convertErrorToMessage(error, ERROR_MESSAGES.RECIPE.GENERATION_FAILED);
}
