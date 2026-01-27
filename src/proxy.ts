import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PRIVATE_ROUTES,
  AUTH_PAGES,
  JWT_VALIDATION_CONFIG,
  FIREBASE_AUTH_COOKIE,
} from "@/lib/constants/auth";
import { deleteAuthCookies } from "@/lib/utils/auth-cookies";
import { logError } from "@/lib/utils/logger";

/**
 * Checks if a given path is a private route.
 */
function isPrivateRoute(path: string): boolean {
  return PRIVATE_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Base64 encoding uses groups of 4 characters.
 * When the input length is not a multiple of 4, padding with "=" is required.
 */
const BASE64_PADDING_SIZE = 4;

/**
 * Decodes base64url JWT payload to UTF-8.
 * Handles both Edge runtime (atob) and Node runtime (Buffer).
 */
function base64UrlToUtf8(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const paddingNeeded = (BASE64_PADDING_SIZE - (base64.length % BASE64_PADDING_SIZE)) % BASE64_PADDING_SIZE;
  const padded = base64.padEnd(base64.length + paddingNeeded, "=");

  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  throw new Error("No base64 decoder available");
}

/**
 * Checks if a JWT token's expiry claim is still valid.
 * 
 * SECURITY NOTE: This only validates the expiry claim, NOT the signature.
 * Signature verification requires Firebase Admin SDK server-side.
 * This is sufficient for client-side route protection, as malicious tokens
 * will fail when used against Firebase services.
 * 
 * @param token - The JWT token to check
 * @returns True if the token has a valid, unexpired exp claim
 */
function hasUnexpiredJwtClaim(token: string): boolean {
  // JWT structure: header.payload.signature (3 parts separated by dots)
  const jwtParts = token.split(".");
  if (jwtParts.length !== 3) return false;

  try {
    const payload = JSON.parse(base64UrlToUtf8(jwtParts[1])) as FirebaseJwtPayload;
    if (!payload?.exp) return false;
    
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Add leeway to account for small time differences between servers
    return payload.exp > nowSeconds - JWT_VALIDATION_CONFIG.EXPIRY_LEEWAY_SECONDS;
  } catch {
    return false;
  }
}

/**
 * Firebase JWT token payload structure.
 */
interface FirebaseJwtPayload {
  exp?: number;
  sub?: string;
  user_id?: string;
}

/**
 * Attempts to extract and parse the payload from a JWT token.
 * @param token - The JWT token
 * @returns The parsed payload or null if invalid
 */
function tryGetJwtPayload(token: string): FirebaseJwtPayload | null {
  const jwtParts = token.split(".");
  if (jwtParts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlToUtf8(jwtParts[1])) as FirebaseJwtPayload;
  } catch {
    return null;
  }
}

interface DebugContext {
  path: string;
  cookiePresent: boolean;
  jwtValid: boolean;
  userId?: string | null;
  isAuthPage?: boolean;
}

/**
 * Adds debug headers to the response in development mode.
 * Helps with debugging authentication and routing issues.
 */
function withDebugHeaders(
  response: NextResponse,
  opts: DebugContext
): NextResponse {
  if (process.env.NODE_ENV === "production") return response;
  response.headers.set("x-bakeme-path", opts.path);
  response.headers.set(
    "x-bakeme-auth-cookie",
    opts.cookiePresent ? "present" : "absent"
  );
  response.headers.set(
    "x-bakeme-auth-jwt",
    opts.jwtValid ? "valid" : "invalid_or_expired"
  );
  if (opts.userId) response.headers.set("x-bakeme-user-id", opts.userId);
  if (typeof opts.isAuthPage === "boolean") {
    response.headers.set(
      "x-bakeme-auth-page",
      opts.isAuthPage ? "true" : "false"
    );
  }
  return response;
}

/**
 * Handles authenticated user on auth pages - redirect to app.
 */
function handleAuthenticatedOnAuthPage(
  request: NextRequest,
  debugContext: DebugContext
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/generate";
  return withDebugHeaders(NextResponse.redirect(url), debugContext);
}

/**
 * Handles invalid cookie on auth pages - clear and stay.
 */
function handleInvalidCookieOnAuthPage(
  debugContext: DebugContext
): NextResponse {
  const response = NextResponse.next();
  deleteAuthCookies(response);
  return withDebugHeaders(response, debugContext);
}

/**
 * Handles unauthenticated user on protected routes - redirect to login.
 */
function handleUnauthenticatedOnPrivateRoute(
  request: NextRequest,
  pathname: string,
  debugContext: DebugContext
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", pathname);
  const response = NextResponse.redirect(url);
  deleteAuthCookies(response);
  return withDebugHeaders(response, debugContext);
}

/**
 * Handles normal request flow - allow through with optional user ID header.
 */
function handleNormalRequest(
  userId: string | null,
  jwtValid: boolean,
  debugContext: DebugContext
): NextResponse {
  const response = NextResponse.next();
  if (userId && jwtValid) {
    response.headers.set("x-user-id", userId);
  }
  return withDebugHeaders(response, debugContext);
}

/**
 * Next.js 16 Proxy - handles route protection at the edge.
 * 
 * Execution flow:
 * 1. Runs before every page render (edge runtime)
 * 2. Validates JWT token from cookie (expiry check only, no signature verification)
 * 3. Applies routing logic with early returns for clarity
 * 4. Handles redirects and cookie cleanup as needed
 * 
 * Benefits:
 * - Prevents flash of protected content
 * - Clear control flow with early returns
 * - Clean redirects with proper error handling
 */
export function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Determine route type
    const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

    // Extract and validate auth token
    const authToken = request.cookies.get(FIREBASE_AUTH_COOKIE)?.value;
    const cookiePresent = authToken != null;
    const payload = authToken != null ? tryGetJwtPayload(authToken) : null;
    const jwtValid = authToken != null && payload != null && hasUnexpiredJwtClaim(authToken);
    const userId = payload?.user_id ?? payload?.sub ?? null;
    const isAuthenticated = cookiePresent && jwtValid;

    // Log expired token detection for debugging
    if (cookiePresent && !jwtValid && process.env.NODE_ENV === "development") {
      logError("Expired or invalid auth token detected", undefined, {
        pathname,
        userId,
        isAuthPage,
      });
    }

    const debugContext = {
      path: pathname,
      cookiePresent,
      jwtValid,
      userId,
      isAuthPage,
    };

    // Auth pages with valid authentication => redirect to app
    if (isAuthPage && isAuthenticated) {
      return handleAuthenticatedOnAuthPage(request, debugContext);
    }

    // Auth pages with invalid cookie => clear cookie and stay
    if (isAuthPage && cookiePresent && !jwtValid) {
      return handleInvalidCookieOnAuthPage(debugContext);
    }

    // Protected routes without authentication => redirect to login
    if (isPrivateRoute(pathname) && !isAuthenticated) {
      return handleUnauthenticatedOnPrivateRoute(request, pathname, debugContext);
    }

    // All other cases => allow through
    return handleNormalRequest(userId, jwtValid, debugContext);
  } catch (error) {
    const { pathname } = request.nextUrl;
    
    // Log all proxy errors for debugging
    logError("Proxy error encountered", error, { pathname });
    
    const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
    const isPrivate = isPrivateRoute(pathname);

    // For auth pages, allow through even on error to avoid redirect loops
    if (isAuthPage) {
      return NextResponse.next();
    }

    // For protected routes, fail closed (redirect to login) as a security measure
    // This prevents accessing protected content if auth validation fails
    if (isPrivate) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(url);
      deleteAuthCookies(response);
      return response;
    }

    // For public routes, allow through despite error
    // Public content should remain accessible even if auth check fails
    return NextResponse.next();
  }
}

// Keep default export for compatibility; Next's proxy template prefers the named `proxy` export.
export default proxy;

/**
 * Proxy configuration.
 * Note: Must be static for Next.js build-time analysis.
 * Keep in sync with PRIVATE_ROUTES and AUTH_PAGES constants.
 */
export const config = {
  matcher: [
    // Protected routes (from PRIVATE_ROUTES)
    "/generate/:path*",
    "/profile/:path*",
    "/saved/:path*",
    // Auth pages (from AUTH_PAGES - so signed-in users get redirected away, and invalid cookies get cleared)
    "/login",
    "/signup",
    "/reset-password",
  ],
};
