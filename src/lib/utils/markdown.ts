/**
 * Markdown parsing utilities for recipe content.
 * These are fallback functions used when structured data is unavailable.
 */

/**
 * Extracts the title from markdown content.
 */
export function extractTitle(content: string): string {
  const match = content.match(/^# (.*)$/m);
  return match ? match[1].trim() : "New Recipe";
}

/**
 * Extracts ingredients list from markdown content.
 */
export function extractIngredients(content: string): string[] {
  const match = content.match(/## Ingredients\n([\s\S]*?)(?=##|$)/);
  if (!match) return [];
  
  return match[1]
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.trim().replace(/^- /, ""));
}

/**
 * Extracts a specific field value from markdown content.
 */
export function extractField(content: string, fieldName: string): string {
  const match = content.match(new RegExp(`- ${fieldName}: (.*)`));
  return match?.[1] || "";
}

/**
 * Extracts the servings number from markdown content.
 */
export function extractServings(content: string): number {
  const match = content.match(/- Servings: (\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
