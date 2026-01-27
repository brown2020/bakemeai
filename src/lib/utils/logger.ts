/**
 * Error logging utility for consistent error handling across the application.
 * In production, this can be extended to integrate with error reporting services.
 */

interface LogContext {
  [key: string]: unknown;
}

/**
 * Logs an error with optional context information.
 */
export function logError(
  message: string,
  error?: unknown,
  context?: LogContext
): void {
  if (process.env.NODE_ENV === "development") {
    console.error(message, error, context);
  } else {
    // In production, this would integrate with a service like Sentry, LogRocket, etc.
    // For now, we still log to console but in a structured format
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: error instanceof Error ? error.message : String(error),
        context,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

/**
 * Logs a warning with optional context information.
 */
export function logWarning(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(message, context);
  } else {
    console.warn(
      JSON.stringify({
        level: "warn",
        message,
        context,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

/**
 * Logs an informational message with optional context information.
 */
export function logInfo(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === "development") {
    console.info(message, context);
  } else {
    console.info(
      JSON.stringify({
        level: "info",
        message,
        context,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

/**
 * Creates a user-friendly error message from a Firebase error or generic error.
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle Firebase-specific error codes
    const message = error.message;
    if (message.includes("auth/")) {
      return formatFirebaseAuthError(message);
    }
    if (message.includes("firestore/")) {
      return formatFirestoreError(message);
    }
    return message;
  }
  return "An unexpected error occurred. Please try again.";
}

function formatFirebaseAuthError(message: string): string {
  if (message.includes("auth/user-not-found")) {
    return "No account found with this email address.";
  }
  if (message.includes("auth/wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (message.includes("auth/email-already-in-use")) {
    return "An account with this email already exists.";
  }
  if (message.includes("auth/weak-password")) {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (message.includes("auth/invalid-email")) {
    return "Invalid email address.";
  }
  if (message.includes("auth/too-many-requests")) {
    return "Too many failed attempts. Please try again later.";
  }
  return message;
}

function formatFirestoreError(message: string): string {
  if (message.includes("permission-denied")) {
    return "You don't have permission to perform this action.";
  }
  if (message.includes("not-found")) {
    return "The requested data was not found.";
  }
  if (message.includes("already-exists")) {
    return "This data already exists.";
  }
  return message;
}
