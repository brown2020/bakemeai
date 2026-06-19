import { describe, expect, it } from "vitest";

import type { RateLimitBucket } from "@/lib/utils/rate-limit";
import { consumeRateLimit } from "@/lib/utils/rate-limit";

const config = {
  maxRequests: 2,
  windowMs: 1000,
};

describe("consumeRateLimit", () => {
  it("allows requests until the configured limit is reached", () => {
    const buckets = new Map<string, RateLimitBucket>();

    expect(consumeRateLimit(buckets, "user-1", config, 0)).toMatchObject({
      allowed: true,
      remaining: 1,
      resetAt: 1000,
    });
    expect(consumeRateLimit(buckets, "user-1", config, 100)).toMatchObject({
      allowed: true,
      remaining: 0,
      resetAt: 1000,
    });
  });

  it("blocks requests beyond the configured limit", () => {
    const buckets = new Map<string, RateLimitBucket>();

    consumeRateLimit(buckets, "user-1", config, 0);
    consumeRateLimit(buckets, "user-1", config, 100);

    expect(consumeRateLimit(buckets, "user-1", config, 200)).toMatchObject({
      allowed: false,
      remaining: 0,
      resetAt: 1000,
    });
  });

  it("resets after the window expires", () => {
    const buckets = new Map<string, RateLimitBucket>();

    consumeRateLimit(buckets, "user-1", config, 0);
    consumeRateLimit(buckets, "user-1", config, 100);

    expect(consumeRateLimit(buckets, "user-1", config, 1000)).toMatchObject({
      allowed: true,
      remaining: 1,
      resetAt: 2000,
    });
  });

  it("tracks keys independently", () => {
    const buckets = new Map<string, RateLimitBucket>();

    consumeRateLimit(buckets, "user-1", config, 0);
    consumeRateLimit(buckets, "user-1", config, 100);

    expect(consumeRateLimit(buckets, "user-2", config, 200)).toMatchObject({
      allowed: true,
      remaining: 1,
      resetAt: 1200,
    });
  });
});
