import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { FIREBASE_AUTH_COOKIE } from "@/lib/constants/auth";
import {
  readLookupUser,
  requireAuthenticatedUserId,
  requireGenerationUser,
} from "./server-auth";

function createTestJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}

describe("requireAuthenticatedUserId", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("denies when auth cookie is missing", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);

    await expect(requireAuthenticatedUserId()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(requireGenerationUser()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

describe("readLookupUser", () => {
  it("treats emailVerified as true only when the lookup says true", () => {
    expect(
      readLookupUser({ users: [{ localId: "uid-1", emailVerified: true }] })
    ).toEqual({ uid: "uid-1", emailVerified: true });
    expect(readLookupUser({ users: [{ localId: "uid-1" }] })).toEqual({
      uid: "uid-1",
      emailVerified: false,
    });
    expect(readLookupUser({ users: [] })).toBeNull();
  });
});

describe("requireGenerationUser", () => {
  const originalKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  beforeEach(() => {
    vi.unstubAllGlobals();
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    } else {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = originalKey;
    }
    vi.unstubAllGlobals();
  });

  it("rejects an unverified email before generation", async () => {
    const token = createTestJwt({
      user_id: "uid-1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === FIREBASE_AUTH_COOKIE ? { value: token } : undefined,
    } as never);

    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ users: [{ localId: "uid-1", emailVerified: false }] }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(requireGenerationUser()).rejects.toMatchObject({
      code: "EMAIL_NOT_VERIFIED",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("accounts:lookup"),
      expect.objectContaining({ redirect: "error" })
    );
  });
});
