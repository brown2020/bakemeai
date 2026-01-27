/**
 * Error logging utility for consistent error handling across the application.
 * Set NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=true to enable console logging in production.
 */

interface LogContext {
  [key: string]: unknown;
}

/**
 * Determines if console logging should be enabled.
 * Always enabled in development, configurable in production via env var.
 */
const shouldLog = (): boolean => {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS === "true";
};

/**
 * Logs an error with optional context information.
 * In development: logs to console with full details.
 * In production: structured JSON logging (only if enabled via env var).
 * @param message - Descriptive error message
 * @param error - The error object or value
 * @param context - Additional context for debugging
 */
export function logError(
  message: string,
  error?: unknown,
  context?: LogContext
) {
  if (!shouldLog()) return;

  if (process.env.NODE_ENV === "development") {
    console.error(message, error, context);
  } else {
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
 * @param message - Warning message
 * @param context - Additional context for debugging
 */
export function logWarning(message: string, context?: LogContext) {
  if (!shouldLog()) return;

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
 * @param message - Info message
 * @param context - Additional context for debugging
 */
export function logInfo(message: string, context?: LogContext) {
  if (!shouldLog()) return;

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
