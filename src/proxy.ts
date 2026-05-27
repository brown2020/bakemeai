/**
 * Next.js 16 Proxy - handles route protection at the edge.
 *
 * SECURITY MODEL:
 * This proxy validates JWT expiry claims WITHOUT signature verification.
 * Signature verification requires Firebase Admin SDK (Node.js runtime), which
 * is unavailable in Edge runtime where proxy.ts executes.
 *
 * RISK ACCEPTANCE:
 * - Unsigned validation is intentional for this use case
 * - Primary purpose: Prevent flash of protected content and improve UX
 * - Security boundary: Firestore rules + server action token verification
 * - Impact: Attacker with forged token could briefly see protected UI shells (no data)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  PRIVATE_ROUTES,
  AUTH_PAGES,
  FIREBASE_AUTH_COOKIE,
} from "@/lib/constants/auth";
import { deleteAuthCookies } from "@/lib/utils/auth-cookies";
import {
  getUserIdFromJwtPayload,
  hasUnexpiredJwtClaimUnsigned,
  parseJwtPayload,
} from "@/lib/utils/jwt";
import { logError } from "@/lib/utils/logger";
import { isAuthPage, isPrivateRoute } from "@/lib/utils/route-match";

// ============================================================================
// RESPONSE BUILDING UTILITIES
// ============================================================================

interface DebugContext {
  path: string;
  cookiePresent: boolean;
  jwtValid: boolean;
  userId?: string | null;
  isAuthPage?: boolean;
}

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

function handleAuthenticatedOnAuthPage(
  request: NextRequest,
  debugContext: DebugContext
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/generate";
  return withDebugHeaders(NextResponse.redirect(url), debugContext);
}

function handleInvalidCookieOnAuthPage(
  debugContext: DebugContext
): NextResponse {
  const response = NextResponse.next();
  deleteAuthCookies(response);
  return withDebugHeaders(response, debugContext);
}

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

// ============================================================================
// MAIN PROXY FUNCTION
// ============================================================================

export function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const onAuthPage = isAuthPage(pathname);

    const authToken = request.cookies.get(FIREBASE_AUTH_COOKIE)?.value;
    const cookiePresent = authToken != null;
    const payload = authToken != null ? parseJwtPayload(authToken) : null;
    const jwtValid =
      authToken != null &&
      payload != null &&
      hasUnexpiredJwtClaimUnsigned(authToken);
    const userId = getUserIdFromJwtPayload(payload);
    const isAuthenticated = cookiePresent && jwtValid;

    if (cookiePresent && !jwtValid && process.env.NODE_ENV === "development") {
      logError("Expired or invalid auth token detected", undefined, {
        pathname,
        userId,
        isAuthPage: onAuthPage,
      });
    }

    const debugContext = {
      path: pathname,
      cookiePresent,
      jwtValid,
      userId,
      isAuthPage: onAuthPage,
    };

    if (onAuthPage && isAuthenticated) {
      return handleAuthenticatedOnAuthPage(request, debugContext);
    }

    if (onAuthPage && cookiePresent && !jwtValid) {
      return handleInvalidCookieOnAuthPage(debugContext);
    }

    if (isPrivateRoute(pathname) && !isAuthenticated) {
      return handleUnauthenticatedOnPrivateRoute(
        request,
        pathname,
        debugContext
      );
    }

    return handleNormalRequest(userId, jwtValid, debugContext);
  } catch (error) {
    const { pathname } = request.nextUrl;

    logError("Proxy error encountered", error, { pathname });

    const onAuthPage = isAuthPage(pathname);
    const isPrivate = isPrivateRoute(pathname);

    if (onAuthPage) {
      return NextResponse.next();
    }

    if (isPrivate) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(url);
      deleteAuthCookies(response);
      return response;
    }

    return NextResponse.next();
  }
}

export default proxy;

/**
 * Proxy configuration.
 * Note: Must be static for Next.js build-time analysis.
 * Manually kept in sync with PRIVATE_ROUTES and AUTH_PAGES constants.
 */
export const config = {
  matcher: [
    "/generate/:path*",
    "/profile/:path*",
    "/saved/:path*",
    "/login",
    "/signup",
    "/reset-password",
  ],
};

if (process.env.NODE_ENV === "development") {
  const expectedRoutes = PRIVATE_ROUTES.map((route) => `${route}/:path*`);
  const expectedMatcher = [...expectedRoutes, ...AUTH_PAGES];

  const isInSync =
    config.matcher.length === expectedMatcher.length &&
    config.matcher.every((route, i) => route === expectedMatcher[i]);

  if (!isInSync) {
    logError("Proxy config matcher out of sync with constants", undefined, {
      configMatcher: config.matcher,
      expectedMatcher,
    });
  }
}
