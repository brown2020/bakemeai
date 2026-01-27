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
