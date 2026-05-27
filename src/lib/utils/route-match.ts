/**
 * Route prefix matching for proxy and auth guards.
 * Uses segment boundaries to avoid false positives (e.g. /login vs /login-help).
 */

import { AUTH_PAGES, PRIVATE_ROUTES } from "@/lib/constants/auth";

/**
 * Returns true when pathname equals route or is a nested path under route.
 */
export function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * Returns true when pathname matches any route in the list.
 */
export function matchesAnyRoute(
  pathname: string,
  routes: readonly string[]
): boolean {
  return routes.some((route) => matchesRoute(pathname, route));
}

export function isPrivateRoute(pathname: string): boolean {
  return matchesAnyRoute(pathname, PRIVATE_ROUTES);
}

export function isAuthPage(pathname: string): boolean {
  return matchesAnyRoute(pathname, AUTH_PAGES);
}
