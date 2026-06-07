import { describe, expect, it } from "vitest";

import { stripLeadingTitleHeading } from "@/lib/utils/markdown";

describe("stripLeadingTitleHeading", () => {
  it("removes a leading '# <title>' heading matching the title", () => {
    const content = "# Omelette\n# Recipe Details\n- Servings: 2";
    expect(stripLeadingTitleHeading(content, "Omelette")).toBe(
      "# Recipe Details\n- Servings: 2"
    );
  });

  it("leaves body-only content unchanged", () => {
    const content = "# Recipe Details\n- Servings: 2";
    expect(stripLeadingTitleHeading(content, "Omelette")).toBe(content);
  });

  it("does not strip when the first line is a different heading", () => {
    const content = "# Something Else\n- Servings: 2";
    expect(stripLeadingTitleHeading(content, "Omelette")).toBe(content);
  });

  it("returns empty string when content is only the title heading", () => {
    expect(stripLeadingTitleHeading("# Omelette", "Omelette")).toBe("");
  });

  it("returns content unchanged when title is empty", () => {
    const content = "# Omelette\nbody";
    expect(stripLeadingTitleHeading(content, "")).toBe(content);
  });

  it("trims the title before matching", () => {
    const content = "# Omelette\nbody";
    expect(stripLeadingTitleHeading(content, "  Omelette  ")).toBe("body");
  });
});
