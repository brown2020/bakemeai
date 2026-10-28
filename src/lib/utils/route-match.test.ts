import { describe, expect, it } from "vitest";

import {
  decideProxyAccess,
  isAuthPage,
  isPrivateRoute,
  matchesRoute,
} from "@/lib/utils/route-match";

describe("route-match utilities", () => {
  it("matches exact and nested private routes", () => {
    expect(matchesRoute("/generate", "/generate")).toBe(true);
    expect(matchesRoute("/generate/step", "/generate")).toBe(true);
    expect(isPrivateRoute("/generate")).toBe(true);
    expect(isPrivateRoute("/profile")).toBe(true);
    expect(isPrivateRoute("/saved")).toBe(true);
  });

  it("does not match prefix-only false positives", () => {
    expect(matchesRoute("/generated", "/generate")).toBe(false);
    expect(matchesRoute("/login-help", "/login")).toBe(false);
    expect(isPrivateRoute("/generated")).toBe(false);
    expect(isAuthPage("/login-help")).toBe(false);
  });

  it("matches auth pages exactly and nested paths", () => {
    expect(isAuthPage("/login")).toBe(true);
    expect(isAuthPage("/signup")).toBe(true);
    expect(isAuthPage("/reset-password")).toBe(true);
    expect(isAuthPage("/reset-password/confirm")).toBe(true);
    expect(isAuthPage("/about")).toBe(false);
  });

  it("lets an expired cookie through so the client can refresh", () => {
    expect(decideProxyAccess("/generate", true, false)).toEqual({ type: "next" });
    expect(decideProxyAccess("/saved", true, false)).toEqual({ type: "next" });
    expect(decideProxyAccess("/profile", true, false)).toEqual({ type: "next" });
  });

  it("redirects private routes only when the auth cookie is missing", () => {
    expect(decideProxyAccess("/generate", false, false)).toEqual({
      type: "redirect",
      pathname: "/login",
    });
  });

  it("sends a valid session away from auth pages", () => {
    expect(decideProxyAccess("/login", true, true)).toEqual({
      type: "redirect",
      pathname: "/generate",
    });
    expect(decideProxyAccess("/login", true, false)).toEqual({ type: "next" });
  });

  it("leaves public routes unprotected", () => {
    expect(isPrivateRoute("/")).toBe(false);
    expect(isPrivateRoute("/about")).toBe(false);
    expect(isPrivateRoute("/privacy")).toBe(false);
    expect(isAuthPage("/")).toBe(false);
  });
});
