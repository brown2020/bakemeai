/**
 * Standardized error handling utilities.
 * Provides consistent error messages and logging across the application.
 */

import { logError } from "./logger";

export interface ErrorContext {
  [key: string]: unknown;
}

/**
 * Standard error messages for common operations.
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
 * @param error - The error object
 * @param logMessage - The message to log for debugging
 * @param context - Additional context for debugging
 * @param userMessage - The message to show to the user
 * @returns The user-friendly error message
 */
export function handleError(
  error: unknown,
  logMessage: string,
  context: ErrorContext,
  userMessage: string
): string {
  logError(logMessage, error, context);
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
