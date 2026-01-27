import { Timestamp } from "firebase/firestore";
import { z } from "zod";

/**
 * Firestore utility functions for consistent data handling.
 */

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
