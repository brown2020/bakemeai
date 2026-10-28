import type { RateLimitBucket } from "@/lib/utils/rate-limit";
import { consumeRateLimit } from "@/lib/utils/rate-limit";

/**
 * Shared generation cap. Firestore rules in `firestore.rules` must use the
 * same maxRequests (8) and windowMs (60000). clockSkewMs is the rules
 * tolerance between Date.now() and request.time when writing windowStart.
 */
export const GENERATION_QUOTA = {
  maxRequests: 8,
  windowMs: 60_000,
  clockSkewMs: 10_000,
} as const;

export const GENERATION_QUOTA_COLLECTION = "generationRateLimits";

export interface QuotaDocument {
  count: number;
  windowStart: number;
}

export type QuotaDecision =
  | { type: "allow"; create: boolean; next: QuotaDocument; resetAt: number }
  | { type: "deny"; resetAt: number };

const memoryBuckets = new Map<string, RateLimitBucket>();
let loggedMemoryFallback = false;

/**
 * Decides the next quota document. A missing or expired window starts at 1.
 * Otherwise the count increments until maxRequests.
 */
export function decideGenerationQuota(
  existing: QuotaDocument | null,
  now: number,
  quota = GENERATION_QUOTA
): QuotaDecision {
  if (!existing || now - existing.windowStart >= quota.windowMs) {
    return {
      type: "allow",
      create: existing == null,
      next: { count: 1, windowStart: now },
      resetAt: now + quota.windowMs,
    };
  }

  if (existing.count >= quota.maxRequests) {
    return {
      type: "deny",
      resetAt: existing.windowStart + quota.windowMs,
    };
  }

  return {
    type: "allow",
    create: false,
    next: {
      count: existing.count + 1,
      windowStart: existing.windowStart,
    },
    resetAt: existing.windowStart + quota.windowMs,
  };
}

export interface GenerationQuotaResult {
  allowed: boolean;
  resetAt: number;
  source: "firestore" | "memory";
}

interface ApplyGenerationQuotaOptions {
  idToken: string;
  userId: string;
  projectId: string | undefined;
  now?: number;
  fetchImpl?: typeof fetch;
  memoryBuckets?: Map<string, RateLimitBucket>;
  warn?: (message: string) => void;
}

type ReadResult =
  | { status: "missing" }
  | { status: "unavailable" }
  | { status: "ok"; doc: QuotaDocument };

type WriteResult = "ok" | "conflict" | "denied" | "unavailable";

function memoryQuota(
  userId: string,
  now: number,
  buckets: Map<string, RateLimitBucket>,
  warn?: (message: string) => void
): GenerationQuotaResult {
  if (!loggedMemoryFallback) {
    loggedMemoryFallback = true;
    warn?.(
      "Durable generation quota is unavailable; using the in-memory fallback"
    );
  }

  if (buckets.size > 200) {
    for (const [key, bucket] of buckets) {
      if (now - bucket.windowStart >= GENERATION_QUOTA.windowMs) {
        buckets.delete(key);
      }
    }
  }

  const result = consumeRateLimit(buckets, userId, GENERATION_QUOTA, now);
  return {
    allowed: result.allowed,
    resetAt: result.resetAt,
    source: "memory",
  };
}

function quotaDocumentUrl(projectId: string, userId: string): string {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${GENERATION_QUOTA_COLLECTION}/${encodeURIComponent(userId)}`;
}

function parseQuotaDocument(payload: unknown): QuotaDocument | null {
  if (!payload || typeof payload !== "object" || !("fields" in payload)) return null;
  const fields = (payload as { fields?: unknown }).fields;
  if (!fields || typeof fields !== "object") return null;
  const count = Number(
    (fields as { count?: { integerValue?: string } }).count?.integerValue
  );
  const windowStart = Number(
    (fields as { windowStart?: { integerValue?: string } }).windowStart
      ?.integerValue
  );
  if (!Number.isInteger(count) || !Number.isInteger(windowStart)) return null;
  return { count, windowStart };
}

async function readQuotaDocument(
  fetchImpl: typeof fetch,
  idToken: string,
  projectId: string,
  userId: string
): Promise<ReadResult> {
  try {
    const response = await fetchImpl(quotaDocumentUrl(projectId, userId), {
      method: "GET",
      headers: { Authorization: `Bearer ${idToken}` },
      cache: "no-store",
      redirect: "error",
    });
    if (response.status === 404) return { status: "missing" };
    if (!response.ok) return { status: "unavailable" };
    const doc = parseQuotaDocument(await response.json());
    return doc ? { status: "ok", doc } : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

async function writeQuotaDocument(
  fetchImpl: typeof fetch,
  idToken: string,
  projectId: string,
  userId: string,
  next: QuotaDocument,
  create: boolean
): Promise<WriteResult> {
  const body = JSON.stringify({
    fields: {
      count: { integerValue: String(next.count) },
      windowStart: { integerValue: String(next.windowStart) },
    },
  });
  const headers = {
    Authorization: `Bearer ${idToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = create
      ? await fetchImpl(
          `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${GENERATION_QUOTA_COLLECTION}?documentId=${encodeURIComponent(userId)}`,
          {
            method: "POST",
            headers,
            body,
            cache: "no-store",
            redirect: "error",
          }
        )
      : await fetchImpl(
          `${quotaDocumentUrl(projectId, userId)}?updateMask.fieldPaths=count&updateMask.fieldPaths=windowStart`,
          {
            method: "PATCH",
            headers,
            body,
            cache: "no-store",
            redirect: "error",
          }
        );

    if (response.ok) return "ok";
    if (response.status === 409) return "conflict";
    if (response.status === 403) return "denied";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}

/**
 * Consumes one generation against the Firestore quota document.
 * If the rules are not deployed or Firestore cannot be reached, falls back
 * to the per-instance limiter so generation is not harder-down than today.
 * A rejected increment after a successful read fails closed.
 */
export async function applyGenerationQuota(
  options: ApplyGenerationQuotaOptions
): Promise<GenerationQuotaResult> {
  const now = options.now ?? Date.now();
  const fetchImpl = options.fetchImpl ?? fetch;
  const buckets = options.memoryBuckets ?? memoryBuckets;

  if (!options.projectId) {
    return memoryQuota(options.userId, now, buckets, options.warn);
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await readQuotaDocument(
      fetchImpl,
      options.idToken,
      options.projectId,
      options.userId
    );

    if (current.status === "unavailable") {
      return memoryQuota(options.userId, now, buckets, options.warn);
    }

    const decision = decideGenerationQuota(
      current.status === "ok" ? current.doc : null,
      now
    );

    if (decision.type === "deny") {
      return {
        allowed: false,
        resetAt: decision.resetAt,
        source: "firestore",
      };
    }

    const write = await writeQuotaDocument(
      fetchImpl,
      options.idToken,
      options.projectId,
      options.userId,
      decision.next,
      decision.create
    );

    if (write === "ok") {
      return {
        allowed: true,
        resetAt: decision.resetAt,
        source: "firestore",
      };
    }

    if (write === "conflict") continue;

    if (write === "denied" && !decision.create) {
      return {
        allowed: false,
        resetAt: decision.resetAt,
        source: "firestore",
      };
    }

    return memoryQuota(options.userId, now, buckets, options.warn);
  }

  return memoryQuota(options.userId, now, buckets, options.warn);
}
