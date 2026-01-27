import { RECIPE } from "../constants/ui";

/**
 * Markdown parsing utilities for recipe content.
 * 
 * IMPORTANT: These are emergency fallbacks only.
 * The AI generation flow always provides structured data, making these functions
 * rarely used. They exist only for defensive programming and edge cases.
 */

/**
 * Extracts the title from markdown content.
 * Emergency fallback - AI always provides structured title.
 */
export function extractTitle(content: string): string {
  if (!content) return RECIPE.DEFAULT_TITLE;
  const h1Match = content.match(/^#\s+(.+?)$/m);
  return h1Match?.[1]?.trim() ?? RECIPE.DEFAULT_TITLE;
}

/**
 * Extracts ingredients list from markdown content.
 * Emergency fallback - AI always provides structured ingredients.
 */
export function extractIngredients(content: string): string[] {
  if (!content) return [];
  const match = content.match(/##\s*Ingredients\s*\n([\s\S]*?)(?=\n##|\n#|$)/i);
  if (!match?.[1]) return [];
  
  return match[1]
    .split("\n")
    .map(line => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("*"))
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(item => item.length > 0);
}

/**
 * Extracts a specific field value from markdown content.
 * Emergency fallback - AI always provides structured fields.
 */
export function extractField(content: string, fieldName: string): string {
  if (!content || !fieldName) return "";
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`[-*]\\s*${escapedFieldName}\\s*:\\s*(.+?)$`, "im"));
  return match?.[1]?.trim() || "";
}

/**
 * Extracts the servings number from markdown content.
 * Emergency fallback - AI always provides structured servings.
 */
export function extractServings(content: string): number {
  const DEFAULT_SERVINGS = 4;
  if (!content) return DEFAULT_SERVINGS;
  const match = content.match(/[-*]\s*Servings?\s*:\s*(\d+)/i);
  const servings = match?.[1] ? parseInt(match[1], 10) : DEFAULT_SERVINGS;
  return servings > 0 && servings <= RECIPE.MAX_SERVINGS ? servings : DEFAULT_SERVINGS;
}
