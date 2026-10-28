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
function matchesAnyRoute(
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

export type ProxyAccess =
  | { type: "next" }
  | { type: "redirect"; pathname: "/login" | "/generate" };

/**
 * Route decision for the proxy.
 * A present but expired cookie is allowed through so the client can refresh
 * the Firebase session. Only a missing cookie redirects private routes.
 */
export function decideProxyAccess(
  pathname: string,
  cookiePresent: boolean,
  jwtValid: boolean
): ProxyAccess {
  if (isAuthPage(pathname) && cookiePresent && jwtValid) {
    return { type: "redirect", pathname: "/generate" };
  }

  if (isPrivateRoute(pathname) && !cookiePresent) {
    return { type: "redirect", pathname: "/login" };
  }

  return { type: "next" };
}
