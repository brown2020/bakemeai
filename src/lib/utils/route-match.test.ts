import { describe, expect, it } from "vitest";

import {
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

  it("leaves public routes unprotected", () => {
    expect(isPrivateRoute("/")).toBe(false);
    expect(isPrivateRoute("/about")).toBe(false);
    expect(isPrivateRoute("/privacy")).toBe(false);
    expect(isAuthPage("/")).toBe(false);
  });
});
