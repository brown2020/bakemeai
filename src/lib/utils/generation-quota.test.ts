import { describe, expect, it, vi } from "vitest";

import {
  applyGenerationQuota,
  decideGenerationQuota,
  GENERATION_QUOTA,
} from "@/lib/utils/generation-quota";
import type { RateLimitBucket } from "@/lib/utils/rate-limit";

describe("decideGenerationQuota", () => {
  it("starts a window at one request", () => {
    expect(decideGenerationQuota(null, 1_000)).toEqual({
      type: "allow",
      create: true,
      next: { count: 1, windowStart: 1_000 },
      resetAt: 1_000 + GENERATION_QUOTA.windowMs,
    });
  });

  it("increments inside the window and denies at the cap", () => {
    expect(
      decideGenerationQuota({ count: 7, windowStart: 1_000 }, 2_000)
    ).toMatchObject({
      type: "allow",
      create: false,
      next: { count: 8, windowStart: 1_000 },
    });

    expect(
      decideGenerationQuota({ count: 8, windowStart: 1_000 }, 2_000)
    ).toEqual({
      type: "deny",
      resetAt: 1_000 + GENERATION_QUOTA.windowMs,
    });
  });

  it("opens a new window after the previous one expires", () => {
    expect(
      decideGenerationQuota(
        { count: 8, windowStart: 1_000 },
        1_000 + GENERATION_QUOTA.windowMs
      )
    ).toMatchObject({
      type: "allow",
      create: false,
      next: { count: 1, windowStart: 1_000 + GENERATION_QUOTA.windowMs },
    });
  });
});

describe("applyGenerationQuota", () => {
  const base = {
    idToken: "token",
    userId: "user-1",
    now: 5_000,
    warn: vi.fn(),
  };

  it("uses memory when the Firebase project id is unset", async () => {
    const buckets = new Map<string, RateLimitBucket>();
    const fetchImpl = vi.fn();

    const result = await applyGenerationQuota({
      ...base,
      projectId: undefined,
      fetchImpl,
      memoryBuckets: buckets,
    });

    expect(result.source).toBe("memory");
    expect(result.allowed).toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("creates the quota document when Firestore has none", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ status: 404, ok: false })
      .mockResolvedValueOnce({ status: 200, ok: true });

    const result = await applyGenerationQuota({
      ...base,
      projectId: "bakeme-test",
      fetchImpl,
    });

    expect(result).toMatchObject({ allowed: true, source: "firestore" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[1]?.[1]).toMatchObject({ method: "POST" });
  });

  it("denies without writing when the stored window is full", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({
        fields: {
          count: { integerValue: "8" },
          windowStart: { integerValue: "5000" },
        },
      }),
    });

    const result = await applyGenerationQuota({
      ...base,
      projectId: "bakeme-test",
      fetchImpl,
    });

    expect(result).toMatchObject({ allowed: false, source: "firestore" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("falls back to memory when quota rules are not deployed", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 403, ok: false });
    const buckets = new Map<string, RateLimitBucket>();

    const result = await applyGenerationQuota({
      ...base,
      projectId: "bakeme-test",
      fetchImpl,
      memoryBuckets: buckets,
    });

    expect(result.source).toBe("memory");
    expect(result.allowed).toBe(true);
  });

  it("fails closed when an increment is rejected", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          fields: {
            count: { integerValue: "3" },
            windowStart: { integerValue: "5000" },
          },
        }),
      })
      .mockResolvedValueOnce({ status: 403, ok: false });

    const result = await applyGenerationQuota({
      ...base,
      projectId: "bakeme-test",
      fetchImpl,
    });

    expect(result).toMatchObject({ allowed: false, source: "firestore" });
    expect(fetchImpl.mock.calls[1]?.[1]).toMatchObject({ method: "PATCH" });
  });
});
