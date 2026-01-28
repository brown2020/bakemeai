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
  },
  GENERIC: {
    UNKNOWN: "An unexpected error occurred. Please try again.",
    NETWORK: "Network error. Please check your connection.",
  },
} as const;

/**
 * Converts an error to a user-friendly message.
 * Extracts message from AppError if available, otherwise uses fallback.
 * 
 * @param error - The error to convert
 * @param fallbackMessage - The user-friendly message to show if error doesn't have one
 * @returns User-friendly error message suitable for display
 */
export function convertErrorToMessage(error: unknown, fallbackMessage: string): string {
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
