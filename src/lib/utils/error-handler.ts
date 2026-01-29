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
  if (error && typeof error === "object" && "code" in error) {
    const firebaseError = error as { code: string };
    const firebaseMessage = FIREBASE_ERROR_MESSAGES[firebaseError.code];
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
