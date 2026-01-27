/**
 * Standardized error handling utilities.
 * Provides consistent error messages and logging across the application.
 */

import { logError } from "./logger";

export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Custom application error type with optional error code and context.
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
 * Standard error messages for common operations.
 */
/**
 * Standard error messages for common operations.
 * Centralized to ensure consistent user experience.
 * These are user-facing messages - keep them friendly and actionable.
 */
export const ERROR_MESSAGES = {
  RECIPE: {
    SAVE_FAILED: "Unable to save recipe. Please try again.",
    LOAD_FAILED: "Unable to load recipes. Please try again.",
    DELETE_FAILED: "Unable to delete recipe. Please try again.",
    GENERATION_FAILED: "Failed to generate recipe. Please try again.",
  },
  PROFILE: {
    SAVE_FAILED: "Unable to save profile. Please try again.",
    LOAD_FAILED: "Unable to load profile. Please try again.",
  },
  AUTH: {
    SIGN_IN_FAILED: "Sign in failed. Please try again.",
    SIGN_OUT_FAILED: "Sign out failed. Please try again.",
    GENERIC: "An authentication error occurred.",
  },
  GENERIC: {
    UNKNOWN: "An unexpected error occurred. Please try again.",
    NETWORK: "Network error. Please check your connection.",
  },
} as const;

/**
 * Handles errors with consistent logging and user-friendly messages.
 * 
 * Purpose:
 * - Logs technical details for debugging (developer-facing)
 * - Returns user-friendly message for display (user-facing)
 * - Ensures consistent error handling across the app
 * 
 * @param error - The error object (can be Error, AppError, or unknown)
 * @param logMessage - The message to log for debugging
 * @param context - Additional context for debugging (e.g., userId, recipeId)
 * @param userMessage - The message to show to the user
 * @returns The user-friendly error message
 */
export function handleError(
  error: unknown,
  logMessage: string,
  context: ErrorContext,
  userMessage: string
): string {
  // Log with full technical details for developers
  logError(logMessage, error, context);
  // Return simplified message for end users
  return userMessage;
}

/**
 * Wraps an async operation with standardized error handling.
 * @param operation - The async operation to execute
 * @param logMessage - The message to log on error
 * @param context - Additional context for debugging
 * @param userMessage - The message to show to the user on error
 * @returns Promise that resolves to result or rejects with user message
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  logMessage: string,
  context: ErrorContext,
  userMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = handleError(error, logMessage, context, userMessage);
    throw new Error(message);
  }
}
