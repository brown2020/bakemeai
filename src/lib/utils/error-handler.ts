/**
 * Standardized error handling utilities.
 * Provides consistent error messages and logging across the application.
 */

import { logError } from "./logger";

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
 * Logs error details and returns a user-friendly message.
 * This function combines logging (technical details) with message conversion (user-facing).
 * 
 * Use in UI components to:
 * 1. Log technical error details for debugging
 * 2. Get a safe, user-friendly message to display
 * 
 * @param error - The error (can be any type from catch blocks)
 * @param logMessage - The message to log for debugging
 * @param context - Additional context for debugging (e.g., userId, recipeId)
 * @param userMessage - The fallback message to show to the user
 * @returns The user-friendly error message
 */
export function logAndConvertError(
  error: unknown,
  logMessage: string,
  context: ErrorContext,
  userMessage: string
): string {
  // Convert unknown error to typed error for logging
  let typedError: Error | AppError;
  if (error instanceof Error) {
    typedError = error;
  } else if (error && typeof error === "object" && "message" in error) {
    typedError = new Error(String((error as { message: unknown }).message));
  } else {
    typedError = new Error(String(error));
  }
  
  // Log with full technical details for developers
  logError(logMessage, typedError, context);
  
  // If it's an AppError with a user-friendly message, prefer that
  if (isAppError(typedError) && typedError.message) {
    return typedError.message;
  }
  
  // Otherwise return the provided user message
  return userMessage;
}
