export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitBucket {
  count: number;
  windowStart: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * In-memory fixed-window rate limiter for dependency-light server guards.
 */
export function consumeRateLimit(
  buckets: Map<string, RateLimitBucket>,
  key: string,
  config: RateLimitConfig,
  now: number = Date.now()
): RateLimitResult {
  const existing = buckets.get(key);
  const shouldReset =
    !existing || now - existing.windowStart >= config.windowMs;

  if (shouldReset) {
    buckets.set(key, {
      count: 1,
      windowStart: now,
    });

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - 1),
      resetAt: now + config.windowMs,
    };
  }

  const resetAt = existing.windowStart + config.windowMs;

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - existing.count),
    resetAt,
  };
}
