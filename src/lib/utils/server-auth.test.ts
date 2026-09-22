import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { requireAuthenticatedUserId } from "./server-auth";

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
  });
});
