/**
 * Error logging utility for consistent error handling across the application.
 * Set NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=true to enable console logging in production.
 */

interface LogContext {
  [key: string]: unknown;
}

/**
 * Environment flags computed once at module load.
 */
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const IS_LOGGING_ENABLED = IS_DEVELOPMENT || process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS === "true";

/**
 * Formats an error for logging.
 * Handles Error objects, error-like objects, and primitives.
 */
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return String(error);
}

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
): void {
  if (!IS_LOGGING_ENABLED) return;

  if (IS_DEVELOPMENT) {
    console.error(message, error, context);
  } else {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: formatError(error),
        stack: error instanceof Error ? error.stack : undefined,
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
export function logWarning(message: string, context?: LogContext): void {
  if (!IS_LOGGING_ENABLED) return;

  if (IS_DEVELOPMENT) {
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
export function logInfo(message: string, context?: LogContext): void {
  if (!IS_LOGGING_ENABLED) return;

  if (IS_DEVELOPMENT) {
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
