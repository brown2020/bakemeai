/**
 * Navigation and redirect utilities.
 * Provides safe redirect validation for auth flows.
 */

/**
 * Validates that a redirect path is safe (prevents open redirect vulnerabilities).
 * @param path - The path to validate
 * @returns True if the path is safe to redirect to
 */
export function isSafeRedirectPath(path: string | null | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

/**
 * Gets a safe redirect path or falls back to default.
 * @param path - The requested redirect path
 * @param defaultPath - The fallback path (defaults to "/")
 * @returns A validated safe path
 */
export function getSafeRedirectPath(
  path: string | null | undefined,
  defaultPath: string = "/"
): string {
  return isSafeRedirectPath(path) ? path : defaultPath;
}
