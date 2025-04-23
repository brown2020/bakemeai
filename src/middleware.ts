import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define private routes that require authentication
const PRIVATE_ROUTES = ["/generate", "/profile", "/saved"];

export function middleware(request: NextRequest) {
  // Get the path from the request
  const path = request.nextUrl.pathname;

  // Check if this is a private route
  const isPrivateRoute = PRIVATE_ROUTES.some((route) => path.startsWith(route));

  // Get the auth cookie (assuming Firebase auth token is stored in a cookie)
  const authCookie = request.cookies.get("firebaseAuth")?.value;

  // If it's a private route and there's no auth cookie, redirect to login
  if (isPrivateRoute && !authCookie) {
    const loginUrl = new URL("/login", request.url);
    // Add the current URL as the redirect parameter
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Matcher defining which paths the middleware applies to
  matcher: ["/generate/:path*", "/profile/:path*", "/saved/:path*"],
};
