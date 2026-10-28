import { describe, expect, it } from "vitest";

import { commitTagDraft, splitTrailingTagDraft } from "@/lib/utils/tags";

describe("commitTagDraft", () => {
  it("appends a finished draft without dropping saved tags", () => {
    expect(commitTagDraft(["peanuts"], "shellfish", 100, 50)).toEqual([
      "peanuts",
      "shellfish",
    ]);
  });

  it("keeps the saved list when the draft is still a fragment", () => {
    expect(commitTagDraft(["peanuts", "shellfish"], "s", 100, 50)).toEqual([
      "peanuts",
      "shellfish",
      "s",
    ]);
  });

  it("ignores duplicates and tokens over the length cap", () => {
    expect(
      commitTagDraft(["peanuts"], "peanuts, " + "x".repeat(101) + ", milk", 100, 50)
    ).toEqual(["peanuts", "milk"]);
  });

  it("stops at the item cap", () => {
    expect(commitTagDraft(["a", "b"], "c", 100, 2)).toEqual(["a", "b"]);
  });
});

describe("splitTrailingTagDraft", () => {
  it("commits every token except the fragment after the last comma", () => {
    expect(splitTrailingTagDraft("peanuts, shell")).toEqual({
      committed: "peanuts",
      remainder: " shell",
    });
  });
});
