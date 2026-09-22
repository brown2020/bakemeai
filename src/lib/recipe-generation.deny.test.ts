import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { generateRecipe } from "./recipe-generation.server";

describe("generateRecipe unauthorized deny", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("denies the server action when auth cookie is missing", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never);

    await expect(generateRecipe("easy pasta for two", false)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
