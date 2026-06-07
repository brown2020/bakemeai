import { describe, expect, it } from "vitest";

import {
  getSafeRedirectPath,
  isSafeRedirectPath,
} from "@/lib/utils/navigation";

describe("isSafeRedirectPath", () => {
  it("accepts relative in-app paths", () => {
    expect(isSafeRedirectPath("/generate")).toBe(true);
    expect(isSafeRedirectPath("/saved")).toBe(true);
    expect(isSafeRedirectPath("/profile?welcome=1")).toBe(true);
  });

  it("rejects protocol-relative and absolute external URLs", () => {
    expect(isSafeRedirectPath("//evil.com")).toBe(false);
    expect(isSafeRedirectPath("https://evil.com")).toBe(false);
    expect(isSafeRedirectPath("http://evil.com")).toBe(false);
  });

  it("rejects paths containing a double slash (path traversal / smuggling)", () => {
    expect(isSafeRedirectPath("/foo//bar")).toBe(false);
  });

  it("rejects backslash paths (browsers may normalize \\ to / -> open redirect)", () => {
    expect(isSafeRedirectPath("/\\evil.com")).toBe(false);
    expect(isSafeRedirectPath("/\\/evil.com")).toBe(false);
  });

  it("rejects non-rooted and empty values", () => {
    expect(isSafeRedirectPath("generate")).toBe(false);
    expect(isSafeRedirectPath("")).toBe(false);
    expect(isSafeRedirectPath(null)).toBe(false);
    expect(isSafeRedirectPath(undefined)).toBe(false);
  });
});

describe("getSafeRedirectPath", () => {
  it("returns the path when it is safe", () => {
    expect(getSafeRedirectPath("/generate")).toBe("/generate");
  });

  it("falls back to the default for unsafe paths", () => {
    expect(getSafeRedirectPath("//evil.com")).toBe("/");
    expect(getSafeRedirectPath("https://evil.com")).toBe("/");
    expect(getSafeRedirectPath(null)).toBe("/");
  });

  it("uses a custom default when provided", () => {
    expect(getSafeRedirectPath(undefined, "/login")).toBe("/login");
    expect(getSafeRedirectPath("//evil.com", "/login")).toBe("/login");
  });
});
