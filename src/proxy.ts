/**
 * Next.js 16 Proxy - handles route protection before the route renders.
 *
 * SECURITY MODEL:
 * This proxy checks that a Firebase ID token cookie is present and unexpired.
 * It does not verify the signature. Signature verification happens in
 * `requireGenerationUser` / `verifyFirebaseIdToken` (Node.js, Identity Toolkit)
 * before OpenAI is called. Firestore rules are the data boundary.
 *
 * An expired cookie is left in place and the request continues. The Firebase
 * client can refresh the ID token and rewrite the cookie. Deleting it here
 * bounced still-signed-in users to /login on every cold load after one hour.
 *
 * A forged unexpired token can only reach the protected UI shell. It cannot
 * read another user's recipes or call OpenAI.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  PRIVATE_ROUTES,
  AUTH_PAGES,
  FIREBASE_AUTH_COOKIE,
} from "@/lib/constants/auth";
import {
  getUserIdFromJwtPayload,
  hasUnexpiredJwtClaimUnsigned,
  parseJwtPayload,
} from "@/lib/utils/jwt";
import { logError } from "@/lib/utils/logger";
import { decideProxyAccess, isAuthPage, isPrivateRoute } from "@/lib/utils/route-match";

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

function redirectTo(
  request: NextRequest,
  pathname: "/login" | "/generate",
  returnPath: string,
  debugContext: DebugContext
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (pathname === "/login") {
    url.searchParams.set("redirect", returnPath);
  }
  return withDebugHeaders(NextResponse.redirect(url), debugContext);
}

export function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const onAuthPage = isAuthPage(pathname);

    const authToken = request.cookies.get(FIREBASE_AUTH_COOKIE)?.value;
    const cookiePresent = typeof authToken === "string" && authToken.length > 0;
    const payload = cookiePresent ? parseJwtPayload(authToken) : null;
    const jwtValid =
      cookiePresent &&
      payload != null &&
      hasUnexpiredJwtClaimUnsigned(authToken);
    const userId = getUserIdFromJwtPayload(payload);

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

    const decision = decideProxyAccess(pathname, cookiePresent, jwtValid);
    if (decision.type === "redirect") {
      return redirectTo(request, decision.pathname, pathname, debugContext);
    }

    return withDebugHeaders(NextResponse.next(), debugContext);
  } catch (error) {
    const { pathname } = request.nextUrl;

    logError("Proxy error encountered", error, { pathname });

    if (isAuthPage(pathname)) {
      return NextResponse.next();
    }

    if (isPrivateRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
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
