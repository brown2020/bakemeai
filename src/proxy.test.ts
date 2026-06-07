import { describe, expect, it } from "vitest";

import { config } from "@/proxy";
import { AUTH_PAGES, PRIVATE_ROUTES } from "@/lib/constants/auth";

/**
 * Route-protection boundary guard.
 *
 * proxy.ts keeps a STATIC `config.matcher` (required for Next.js build-time
 * analysis) that must stay in sync with PRIVATE_ROUTES / AUTH_PAGES. Drift here
 * silently breaks route protection, so assert the invariant the proxy's
 * dev-only runtime check documents — but as a CI-enforced test.
 */
describe("proxy config.matcher", () => {
  it("stays in sync with the route constants", () => {
    const expectedMatcher = [
      ...PRIVATE_ROUTES.map((route) => `${route}/:path*`),
      ...AUTH_PAGES,
    ];

    expect(config.matcher).toEqual(expectedMatcher);
  });

  it("guards every private route with a nested-path matcher", () => {
    for (const route of PRIVATE_ROUTES) {
      expect(config.matcher).toContain(`${route}/:path*`);
    }
  });

  it("matches each auth page exactly (no nested wildcard)", () => {
    for (const page of AUTH_PAGES) {
      expect(config.matcher).toContain(page);
      expect(config.matcher).not.toContain(`${page}/:path*`);
    }
  });
});
