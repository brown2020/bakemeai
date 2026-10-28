import { describe, expect, it } from "vitest";

import { securityHeaders } from "@/lib/utils/security-headers";

function header(name: string): string {
  const match = securityHeaders.find((entry) => entry.key === name);
  if (!match) throw new Error(`missing header ${name}`);
  return match.value;
}

describe("securityHeaders", () => {
  it("sets nosniff, a strict referrer policy, and frame denial", () => {
    expect(header("X-Content-Type-Options")).toBe("nosniff");
    expect(header("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header("X-Frame-Options")).toBe("DENY");
    expect(header("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("keeps Firebase auth connections and does not allow this app to be framed", () => {
    const csp = header("Content-Security-Policy");
    expect(csp).toContain("https://*.googleapis.com");
    expect(csp).toContain("https://accounts.google.com");
    expect(csp).not.toContain("frame-ancestors *");
  });
});
