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
 * Custom Zod schema for required Firestore Timestamp.
 * Validates that the value is a Firestore Timestamp or timestamp-like value.
 * 
 * COMPATIBILITY: Accepts multiple formats that Firestore may return or store:
 * - Timestamp instances (when using Firestore SDK directly)
 * - Plain objects with seconds/nanoseconds (when Firestore serializes data)
 * - Plain numbers (Unix timestamps in milliseconds from legacy data)
 * 
 * Why permissive: Firestore SDK returns different formats depending on context
 * (client SDK vs server SDK, real-time listeners vs one-time reads). Legacy data
 * may also have been stored as plain numbers. We need to accept all valid
 * timestamp representations to support existing data.
 */
export const requiredTimestampSchema = z.custom<Timestamp>(
  (val): val is Timestamp => {
    if (val instanceof Timestamp) return true;
    // Accept plain objects with seconds/nanoseconds (from Firestore serialization)
    if (val && typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val) return true;
    // Accept plain numbers (Unix timestamps in milliseconds from legacy data)
    if (typeof val === 'number') return true;
    return false;
  },
  {
    message: "Expected Firestore Timestamp, timestamp object, or number"
  }
);

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
