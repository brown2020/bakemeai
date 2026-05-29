/**
 * Builds plain-text / markdown for copying a recipe to the clipboard.
 *
 * Reuses the already-displayed markdown body (so a serving-scaled recipe copies
 * its scaled values) and appends macronutrients, which are shown in the nutrition
 * panel but are not part of the markdown body produced by `convertToMarkdown`.
 */

import type { NutritionSummary } from "./nutrition";

export interface RecipeCopyInput {
  /** Recipe title (rendered separately from the markdown body on the generate view). */
  title: string;
  /**
   * Markdown body as displayed. May begin with a `# <title>` heading (saved view,
   * where content comes from `convertToMarkdown`) or with `# Recipe Details`
   * (generate view, where the title is rendered separately).
   */
  content: string;
  /** Nutrition shown in the panel; macros are appended because the body omits them. */
  nutrition?: NutritionSummary | null;
}

/**
 * Assembles the full recipe text for clipboard export.
 * Guarantees exactly one title heading and appends a Nutrition section when macros exist.
 */
export function buildRecipeCopyText({
  title,
  content,
  nutrition,
}: RecipeCopyInput): string {
  const heading = (title ?? "").trim();
  const body = stripLeadingTitle((content ?? "").trim(), heading);

  const parts: string[] = [];
  if (heading) parts.push(`# ${heading}`);
  if (body) parts.push(body);

  const macrosSection = nutrition ? formatMacrosSection(nutrition) : "";
  if (macrosSection) parts.push(macrosSection);

  return parts.join("\n\n").trim();
}

/**
 * Removes a leading `# <title>` heading from the body so the title is not duplicated.
 * Only strips when the first line matches the recipe title exactly.
 */
function stripLeadingTitle(content: string, title: string): string {
  if (!title) return content;

  const newlineIndex = content.indexOf("\n");
  const firstLine = newlineIndex === -1 ? content : content.slice(0, newlineIndex);
  if (firstLine.trim() !== `# ${title}`) return content;

  return newlineIndex === -1 ? "" : content.slice(newlineIndex + 1).trimStart();
}

/**
 * Builds a `## Nutrition` section from macro values (calories already live in the body).
 * Returns an empty string when no macro values are present.
 */
function formatMacrosSection(nutrition: NutritionSummary): string {
  const lines: string[] = [];
  if (hasText(nutrition.protein)) lines.push(`- Protein: ${nutrition.protein}`);
  if (hasText(nutrition.carbs)) lines.push(`- Carbs: ${nutrition.carbs}`);
  if (hasText(nutrition.fat)) lines.push(`- Fat: ${nutrition.fat}`);

  if (lines.length === 0) return "";
  return `## Nutrition\n${lines.join("\n")}`;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
