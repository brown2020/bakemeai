import { describe, expect, it, vi, beforeEach } from "vitest";

import { triggerRecipePrint } from "@/lib/utils/print-recipe";

describe("triggerRecipePrint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls window.print when available", () => {
    const printMock = vi.fn();
    vi.stubGlobal("window", { print: printMock });

    triggerRecipePrint();

    expect(printMock).toHaveBeenCalledOnce();
  });
});
