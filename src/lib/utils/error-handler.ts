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
 * Validation error - thrown when user input fails validation.
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
  }
}

/**
 * Authentication error - thrown when auth operations fail.
 */
export class AuthenticationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "AUTHENTICATION_ERROR", context);
    this.name = "AuthenticationError";
  }
}

/**
 * Network error - thrown when network operations fail.
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "NETWORK_ERROR", context);
    this.name = "NetworkError";
  }
}

/**
 * Database error - thrown when Firestore operations fail.
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "DATABASE_ERROR", context);
    this.name = "DatabaseError";
  }
}

/**
 * Type guard to check if an error is an AppError or its subclass.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is a ValidationError.
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if an error is an AuthenticationError.
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Type guard to check if an error is a NetworkError.
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard to check if an error is a DatabaseError.
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

/**
 * Union type of all possible error types for better type safety.
 */
export type AppErrorLike = Error | AppError | { message: string }

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
 * Type guard to check if an unknown error can be treated as AppErrorLike.
 */
function asAppErrorLike(error: unknown): AppErrorLike {
  if (error instanceof Error) {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return error as { message: string };
  }
  return new Error(String(error));
}

/**
 * Handles errors with consistent logging and user-friendly messages.
 * 
 * Purpose:
 * - Logs technical details for debugging (developer-facing)
 * - Returns user-friendly message for display (user-facing)
 * - Ensures consistent error handling across the app
 * 
 * @param error - The error (can be any type from catch blocks)
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
  // Convert unknown error to AppErrorLike for type safety
  const typedError = asAppErrorLike(error);
  
  // Log with full technical details for developers
  logError(logMessage, typedError, context);
  
  // If it's an AppError with a user-friendly message, prefer that
  if (isAppError(typedError) && typedError.message) {
    return typedError.message;
  }
  
  // Otherwise return the provided user message
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
