import { Timestamp } from "firebase/firestore";
import { z } from "zod";

/**
 * Firestore utility functions for consistent data handling.
 */

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
  
  // Map Firestore error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
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

  return errorMessages[code] || defaultMessage;
}

/**
 * Custom Zod schema for Firestore Timestamp that allows undefined.
 * Validates that the value is either a Firestore Timestamp or undefined.
 */
export const firestoreTimestampSchema = z
  .custom<Timestamp>((val) => {
    if (val === undefined || val === null) return true;
    return val instanceof Timestamp;
  }, "Must be a Firestore Timestamp")
  .optional();

/**
 * Converts a Firestore Timestamp to an ISO string for serialization.
 */
export function timestampToString(timestamp?: Timestamp | null): string | undefined {
  if (!timestamp) return undefined;
  return timestamp.toDate().toISOString();
}

/**
 * Converts a Firestore Timestamp to milliseconds since epoch.
 */
export function timestampToMillis(timestamp?: Timestamp | null): number | undefined {
  if (!timestamp) return undefined;
  return timestamp.toMillis();
}

/**
 * Serializes a Firestore document that may contain Timestamps.
 * Converts Timestamp fields to ISO strings for client-side use.
 */
export function serializeFirestoreDoc<T extends Record<string, unknown>>(
  doc: T
): T & { updatedAtString?: string } {
  const serialized: Record<string, unknown> = { ...doc };
  
  if (doc.updatedAt instanceof Timestamp) {
    serialized.updatedAtString = timestampToString(doc.updatedAt);
  }
  
  return serialized as T & { updatedAtString?: string };
}
