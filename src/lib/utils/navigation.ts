/**
 * Navigation and redirect utilities.
 * Provides safe redirect validation for auth flows to prevent open redirect attacks.
 */

/**
 * Validates that a redirect path is safe (prevents open redirect vulnerabilities).
 * 
 * Security rules enforced:
 * - Must be a non-empty string
 * - Must start with "/" (relative path only)
 * - Must NOT contain "//" anywhere (prevents protocol-relative URLs and path traversal)
 * 
 * This prevents attackers from crafting URLs that redirect users to external malicious sites.
 * 
 * @param path - The path to validate
 * @returns Type predicate indicating if the path is a safe string
 * 
 * @example
 * isSafeRedirectPath("/dashboard")    // true
 * isSafeRedirectPath("//evil.com")    // false
 * isSafeRedirectPath("/foo//bar")     // false
 * isSafeRedirectPath("https://x.com") // false
 * isSafeRedirectPath(null)            // false
 */
export function isSafeRedirectPath(path: string | null | undefined): path is string {
  return typeof path === "string" && path.length > 0 && path.startsWith("/") && !path.includes("//");
}

/**
 * Gets a safe redirect path or falls back to default.
 * Ensures that only validated, safe paths are used for redirects.
 * 
 * @param path - The requested redirect path (may be untrusted user input)
 * @param defaultPath - The fallback path to use if validation fails (defaults to "/")
 * @returns A validated safe path guaranteed to be a relative URL
 * 
 * @example
 * getSafeRedirectPath("/profile")        // "/profile"
 * getSafeRedirectPath("//evil.com")      // "/"
 * getSafeRedirectPath(null, "/login")    // "/login"
 */
export function getSafeRedirectPath(
  path: string | null | undefined,
  defaultPath: string = "/"
): string {
  return isSafeRedirectPath(path) ? path : defaultPath;
}
