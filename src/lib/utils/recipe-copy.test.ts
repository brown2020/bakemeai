import { describe, expect, it } from "vitest";

import { buildRecipeCopyText } from "@/lib/utils/recipe-copy";

const GENERATE_BODY = [
  "# Recipe Details",
  "- Servings: 4",
  "",
  "## Ingredients",
  "- 2 eggs",
].join("\n");

describe("buildRecipeCopyText", () => {
  it("prepends the title when the body has no title heading (generate view)", () => {
    const text = buildRecipeCopyText({
      title: "Omelette",
      content: GENERATE_BODY,
    });

    expect(text.startsWith("# Omelette\n\n# Recipe Details")).toBe(true);
    expect(text).toContain("- 2 eggs");
  });

  it("does not duplicate the title when the body already starts with it (saved view)", () => {
    const savedContent = `# Omelette\n${GENERATE_BODY}`;

    const text = buildRecipeCopyText({
      title: "Omelette",
      content: savedContent,
    });

    expect(text.match(/# Omelette/g)).toHaveLength(1);
    expect(text).toContain("# Recipe Details");
  });

  it("appends a Nutrition section with available macros", () => {
    const text = buildRecipeCopyText({
      title: "Omelette",
      content: GENERATE_BODY,
      nutrition: { calories: 320, protein: "18g", carbs: null, fat: "24g" },
    });

    expect(text).toContain("## Nutrition");
    expect(text).toContain("- Protein: 18g");
    expect(text).toContain("- Fat: 24g");
    expect(text).not.toContain("- Carbs:");
  });

  it("omits the Nutrition section when no macros are present", () => {
    const text = buildRecipeCopyText({
      title: "Omelette",
      content: GENERATE_BODY,
      nutrition: { calories: 320, protein: null, carbs: null, fat: null },
    });

    expect(text).not.toContain("## Nutrition");
  });

  it("handles an empty title gracefully", () => {
    const text = buildRecipeCopyText({ title: "", content: GENERATE_BODY });

    expect(text.startsWith("# Recipe Details")).toBe(true);
  });
});
