import { Timestamp } from "firebase/firestore";
import { z } from "zod";

/**
 * Firestore utility functions for consistent data handling.
 */

/**
 * User-friendly error messages for common Firestore error codes.
 * Centralized for consistency and easier testing.
 */
const FIRESTORE_ERROR_MESSAGES: Record<string, string> = {
  "permission-denied": "You don't have permission for this action. Please sign in again.",
  "unavailable": "Unable to connect to the database. Please check your internet connection.",
  "not-found": "The requested data was not found.",
  "already-exists": "This data already exists.",
  "resource-exhausted": "Storage limit reached. Please contact support.",
  "cancelled": "The operation was cancelled.",
  "deadline-exceeded": "The operation took too long. Please try again.",
  "invalid-argument": "Invalid data provided. Please check your input.",
  "unauthenticated": "Please sign in to continue.",
};

/**
 * Gets a user-friendly error message from a Firestore error code.
 * Provides specific, actionable messages for common Firestore errors.
 * 
 * @param error - The error object from Firestore
 * @param defaultMessage - Fallback message if error code is unrecognized
 * @returns User-friendly error message
 */
export function getFirestoreErrorMessage(
  error: unknown,
  defaultMessage: string
): string {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return defaultMessage;
  }

  const code = (error as { code: string }).code;
  return FIRESTORE_ERROR_MESSAGES[code] ?? defaultMessage;
}

/**
 * Custom Zod schema for Firestore Timestamp that allows undefined.
 * Validates that the value is either a Firestore Timestamp or undefined.
 * Provides clear error messages for invalid timestamp values.
 */
export const firestoreTimestampSchema = z
  .custom<Timestamp>(
    (val): val is Timestamp => {
      if (val === undefined || val === null) return true;
      return val instanceof Timestamp;
    }, 
    {
      message: "Expected Firestore Timestamp or undefined"
    }
  )
  .optional();
