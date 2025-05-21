import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of routes that require authentication
const PRIVATE_ROUTES = ["/generate", "/profile", "/saved"];

/**
 * Checks if a given path is a private route.
 */
function isPrivateRoute(path: string): boolean {
  return PRIVATE_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Middleware to enforce authentication on private routes.
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const authToken = request.cookies.get("firebaseAuth")?.value;

  if (isPrivateRoute(path) && !authToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only apply middleware to these routes
  matcher: ["/generate/:path*", "/profile/:path*", "/saved/:path*"],
};
