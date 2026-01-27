import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIVATE_ROUTES, AUTH_COOKIE_CONFIG } from "@/lib/constants";
import {
  FIREBASE_AUTH_COOKIE,
  LEGACY_FIREBASE_AUTH_COOKIE,
} from "@/lib/auth-constants";

/**
 * Checks if a given path is a private route.
 */
function isPrivateRoute(path: string): boolean {
  return PRIVATE_ROUTES.some((route) => path.startsWith(route));
}

function base64UrlToUtf8(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  // Edge runtime: atob is available. Node: fall back to Buffer.
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

function isUnexpiredJwt(token: string): boolean {
  // Firebase ID token is a JWT. We do a lightweight expiry check here.
  // (Signature verification would require Admin SDK and is out of scope for this app's current model.)
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(base64UrlToUtf8(parts[1])) as { exp?: number };
    if (!payload?.exp) return false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Small leeway for clock skew
    return payload.exp > nowSeconds + AUTH_COOKIE_CONFIG.JWT_EXPIRY_LEEWAY_SECONDS;
  } catch {
    return false;
  }
}

function tryGetJwtPayload(
  token: string
): { exp?: number; sub?: string; user_id?: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlToUtf8(parts[1])) as {
      exp?: number;
      sub?: string;
      user_id?: string;
    };
  } catch {
    return null;
  }
}

function withDebugHeaders(
  response: NextResponse,
  opts: {
    path: string;
    cookiePresent: boolean;
    jwtValid: boolean;
    userId?: string | null;
    isAuthPage?: boolean;
  }
) {
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
 * Next.js 16 Proxy - handles route protection at the edge.
 * This runs before the page renders, preventing flash of protected content.
 */
export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Auth pages should be reachable when signed out, and should redirect away when signed in.
    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/reset-password");

    // Only trust BakeMe's namespaced cookie to avoid collisions on localhost.
    const authToken = request.cookies.get(FIREBASE_AUTH_COOKIE)?.value;
    const cookiePresent = !!authToken;

    const payload = authToken ? tryGetJwtPayload(authToken) : null;
    const jwtValid = !!authToken && !!payload && isUnexpiredJwt(authToken);
    const userId = payload?.user_id ?? payload?.sub ?? null;
    const isAuthenticated = cookiePresent && jwtValid;

    // Auth page + authenticated => redirect to app
    if (isAuthPage && isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/generate";
      return withDebugHeaders(NextResponse.redirect(url), {
        path: pathname,
        cookiePresent,
        jwtValid,
        userId,
        isAuthPage,
      });
    }

    // Auth page + cookie present but invalid => clear it and allow staying on auth page
    if (isAuthPage && cookiePresent && !jwtValid) {
      const response = NextResponse.next();
      response.cookies.delete(FIREBASE_AUTH_COOKIE);
      response.cookies.delete(LEGACY_FIREBASE_AUTH_COOKIE);
      return withDebugHeaders(response, {
        path: pathname,
        cookiePresent,
        jwtValid,
        userId,
        isAuthPage,
      });
    }

    // Protected route + not authenticated => redirect to login
    if (isPrivateRoute(pathname) && !isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(url);
      response.cookies.delete(FIREBASE_AUTH_COOKIE);
      response.cookies.delete(LEGACY_FIREBASE_AUTH_COOKIE);

      return withDebugHeaders(response, {
        path: pathname,
        cookiePresent,
        jwtValid,
        userId,
        isAuthPage,
      });
    }

    // Protected route + cookie present but invalid => redirect to login and clear cookie
    if (isPrivateRoute(pathname) && cookiePresent && !jwtValid) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);

      const response = NextResponse.redirect(url);
      response.cookies.delete(FIREBASE_AUTH_COOKIE);
      response.cookies.delete(LEGACY_FIREBASE_AUTH_COOKIE);

      return withDebugHeaders(response, {
        path: pathname,
        cookiePresent,
        jwtValid,
        userId,
        isAuthPage,
      });
    }

    // If authenticated, attach user id for potential downstream usage.
    const response = NextResponse.next();
    if (isAuthenticated && userId) response.headers.set("x-user-id", userId);

    return withDebugHeaders(response, {
      path: pathname,
      cookiePresent,
      jwtValid,
      userId,
      isAuthPage,
    });
  } catch {
    // Fail closed: redirect to login for protected routes
    const { pathname } = request.nextUrl;
    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup") ||
      pathname.startsWith("/reset-password");

    if (isAuthPage) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete(FIREBASE_AUTH_COOKIE);
    response.cookies.delete(LEGACY_FIREBASE_AUTH_COOKIE);
    return response;
  }
}

// Keep default export for compatibility; Next's proxy template prefers the named `proxy` export.
export default proxy;

export const config = {
  // Only apply middleware to these routes
  matcher: [
    // Protected
    "/generate/:path*",
    "/profile/:path*",
    "/saved/:path*",
    // Auth pages (so signed-in users get redirected away, and invalid cookies get cleared)
    "/login",
    "/signup",
    "/reset-password",
  ],
};
