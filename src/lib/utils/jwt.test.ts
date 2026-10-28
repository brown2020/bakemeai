import { describe, expect, it } from "vitest";

import {
  getIdTokenCookieMaxAgeSeconds,
  getUserIdFromJwtPayload,
  hasUnexpiredJwtClaimUnsigned,
  parseJwtPayload,
} from "@/lib/utils/jwt";

function createTestJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}

describe("jwt utilities", () => {
  it("parses payload and extracts user id", () => {
    const token = createTestJwt({
      sub: "user-abc",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const payload = parseJwtPayload(token);
    expect(getUserIdFromJwtPayload(payload)).toBe("user-abc");
  });

  it("prefers user_id claim when present", () => {
    const payload = {
      user_id: "firebase-uid",
      sub: "legacy-sub",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    expect(getUserIdFromJwtPayload(payload)).toBe("firebase-uid");
  });

  it("returns false for expired tokens", () => {
    const token = createTestJwt({
      sub: "user-abc",
      exp: Math.floor(Date.now() / 1000) - 3600,
    });

    expect(hasUnexpiredJwtClaimUnsigned(token)).toBe(false);
  });

  it("returns true for unexpired tokens", () => {
    const token = createTestJwt({
      sub: "user-abc",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(hasUnexpiredJwtClaimUnsigned(token)).toBe(true);
  });

  it("returns null for malformed tokens", () => {
    expect(parseJwtPayload("not-a-jwt")).toBeNull();
  });
});

describe("getIdTokenCookieMaxAgeSeconds", () => {
  const nowSeconds = 1_700_000_000;
  const nowMs = nowSeconds * 1000;

  it("caps the cookie lifetime at one hour", () => {
    const token = createTestJwt({ exp: nowSeconds + 2 * 60 * 60 });
    expect(getIdTokenCookieMaxAgeSeconds(token, nowMs)).toBe(3600);
  });

  it("uses the remaining token lifetime when it is under an hour", () => {
    const token = createTestJwt({ exp: nowSeconds + 600 });
    expect(getIdTokenCookieMaxAgeSeconds(token, nowMs)).toBe(600);
  });

  it("returns zero when the token is already expired or has no exp", () => {
    const expired = createTestJwt({ exp: nowSeconds - 1 });
    expect(getIdTokenCookieMaxAgeSeconds(expired, nowMs)).toBe(0);
    expect(getIdTokenCookieMaxAgeSeconds(createTestJwt({}), nowMs)).toBe(0);
  });
});
