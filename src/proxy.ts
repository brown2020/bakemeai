import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_ROUTES, AUTH_PAGES, AUTH_COOKIE_CONFIG } from "@/lib/constants";
import { FIREBASE_AUTH_COOKIE } from "@/lib/auth-constants";
import { deleteAuthCookies } from "@/lib/utils/cookies";

/**
 * Checks if a given path is a private route.
 */
function isPrivateRoute(path: string): boolean {
  return PRIVATE_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Base64 padding block size constant.
 * Base64 strings must be multiples of 4 characters.
 */
const BASE64_PADDING_SIZE = 4;

/**
 * Decodes a base64url-encoded string to UTF-8.
 * Handles both Edge runtime (atob) and Node runtime (Buffer).
 * @param input - The base64url-encoded string
 * @returns The decoded UTF-8 string
 */
function base64UrlToUtf8(input: string): string {
  // Convert base64url to standard base64 by replacing URL-safe characters
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed (base64 strings must be multiples of BASE64_PADDING_SIZE)
  const paddingNeeded = (BASE64_PADDING_SIZE - (base64.length % BASE64_PADDING_SIZE)) % BASE64_PADDING_SIZE;
  const padded = base64.padEnd(base64.length + paddingNeeded, "=");

  // Edge runtime: atob is available. Node: fall back to Buffer.
  if (typeof atob === "function") {
    // Decode base64 to binary string, then convert to UTF-8
    // This handles multi-byte UTF-8 characters correctly
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
 * Validates that a JWT token has not expired.
 * Includes a small leeway for clock skew.
 * @param token - The JWT token to validate
 * @returns True if the token is valid and not expired
 */
function isUnexpiredJwt(token: string): boolean {
  // Firebase ID token is a JWT. We do a lightweight expiry check here.
  // (Signature verification would require Admin SDK and is out of scope for this app's current model.)
  
  // JWT structure: header.payload.signature (3 parts separated by dots)
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(base64UrlToUtf8(parts[1])) as FirebaseJwtPayload;
    if (!payload?.exp) return false;
    
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Add leeway (5s) to account for small time differences between servers
    // Token is valid if: exp > (now - leeway), or equivalently: exp > now + (-leeway)
    return payload.exp > nowSeconds - AUTH_COOKIE_CONFIG.JWT_EXPIRY_LEEWAY_SECONDS;
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
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlToUtf8(parts[1])) as FirebaseJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Adds debug headers to the response in development mode.
 * Helps with debugging authentication and routing issues.
 * @param response - The NextResponse object
 * @param opts - Debug information to include in headers
 * @returns The response with debug headers added
 */
function withDebugHeaders(
  response: NextResponse,
  opts: {
    path: string;
    cookiePresent: boolean;
    jwtValid: boolean;
    userId?: string | null;
    isAuthPage?: boolean;
  }
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
 * Available route actions for proxy decision-making.
 * Using enum for type safety and better IDE support.
 */
export enum RouteAction {
  ALLOW = "allow",
  REDIRECT = "redirect",
  CLEAR_AND_ALLOW = "clear-and-allow",
  CLEAR_AND_REDIRECT = "clear-and-redirect",
}

/**
 * Route decision result for cleaner proxy logic.
 */
interface RouteDecision {
  action: RouteAction;
  redirectTo?: string;
  includeRedirectParam?: boolean;
}

/**
 * Determines the appropriate routing action based on auth state and route type.
 * Centralized decision logic for better maintainability and testing.
 */
function determineRouteAction(
  pathname: string,
  isAuthPage: boolean,
  isAuthenticated: boolean,
  cookiePresent: boolean,
  jwtValid: boolean
): RouteDecision {
  // Auth pages with valid authentication => redirect to app
  if (isAuthPage && isAuthenticated) {
    return { action: RouteAction.REDIRECT, redirectTo: "/generate" };
  }

  // Auth pages with invalid cookie => clear cookie and stay
  if (isAuthPage && cookiePresent && !jwtValid) {
    return { action: RouteAction.CLEAR_AND_ALLOW };
  }

  // Protected routes without authentication => redirect to login
  if (isPrivateRoute(pathname) && !isAuthenticated) {
    return { 
      action: RouteAction.CLEAR_AND_REDIRECT, 
      redirectTo: "/login", 
      includeRedirectParam: true 
    };
  }

  // All other cases => allow through
  return { action: RouteAction.ALLOW };
}

/**
 * Executes the routing decision by creating appropriate NextResponse.
 */
function executeRouteDecision(
  decision: RouteDecision,
  request: NextRequest,
  debugContext: {
    path: string;
    cookiePresent: boolean;
    jwtValid: boolean;
    userId: string | null;
    isAuthPage: boolean;
  }
): NextResponse {
  const { pathname } = request.nextUrl;

  switch (decision.action) {
    case RouteAction.REDIRECT: {
      const url = request.nextUrl.clone();
      url.pathname = decision.redirectTo!;
      return withDebugHeaders(NextResponse.redirect(url), debugContext);
    }

    case RouteAction.CLEAR_AND_ALLOW: {
      const response = NextResponse.next();
      deleteAuthCookies(response);
      return withDebugHeaders(response, debugContext);
    }

    case RouteAction.CLEAR_AND_REDIRECT: {
      const url = request.nextUrl.clone();
      url.pathname = decision.redirectTo!;
      if (decision.includeRedirectParam) {
        url.searchParams.set("redirect", pathname);
      }
      const response = NextResponse.redirect(url);
      deleteAuthCookies(response);
      return withDebugHeaders(response, debugContext);
    }

    case RouteAction.ALLOW: {
      const response = NextResponse.next();
      // Attach user ID header for downstream usage if authenticated
      if (debugContext.userId && debugContext.jwtValid) {
        response.headers.set("x-user-id", debugContext.userId);
      }
      return withDebugHeaders(response, debugContext);
    }
  }
}

/**
 * Next.js 16 Proxy - handles route protection at the edge.
 * 
 * Execution flow:
 * 1. Runs before every page render (edge runtime)
 * 2. Validates JWT token from cookie (expiry check only, no signature verification)
 * 3. Determines routing action based on auth state and route type
 * 4. Executes the routing decision (redirect, clear cookies, or allow)
 * 
 * Benefits:
 * - Prevents flash of protected content
 * - Centralized auth logic with clear decision flow
 * - Clean redirects with proper error handling
 * - Easier to test and maintain
 */
export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Determine route type
    const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

    // Extract and validate auth token
    const authToken = request.cookies.get(FIREBASE_AUTH_COOKIE)?.value;
    const cookiePresent = !!authToken;
    const payload = authToken ? tryGetJwtPayload(authToken) : null;
    const jwtValid = !!authToken && !!payload && isUnexpiredJwt(authToken);
    const userId = payload?.user_id ?? payload?.sub ?? null;
    const isAuthenticated = cookiePresent && jwtValid;

    // Determine what to do
    const decision = determineRouteAction(
      pathname,
      isAuthPage,
      isAuthenticated,
      cookiePresent,
      jwtValid
    );

    // Execute the decision
    return executeRouteDecision(decision, request, {
      path: pathname,
      cookiePresent,
      jwtValid,
      userId,
      isAuthPage,
    });
  } catch {
    // Fail closed: redirect to login for protected routes
    const { pathname } = request.nextUrl;
    const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

    if (isAuthPage) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(url);
    deleteAuthCookies(response);
    return response;
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
