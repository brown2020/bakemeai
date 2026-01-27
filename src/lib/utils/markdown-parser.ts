import { RECIPE } from "../constants/ui";
import { logWarning } from "./logger";

/**
 * Markdown parsing utilities for recipe content.
 * Legacy fallback for extracting recipe data when structured data is incomplete.
 */

/**
 * Extracts the title from markdown content.
 * Legacy fallback for edge cases where structured data is incomplete.
 */
export function extractTitle(content: string): string {
  if (!content) return RECIPE.DEFAULT_TITLE;
  
  const h1Match = content.match(/^#\s+(.+?)$/m);
  return h1Match?.[1]?.trim() ?? RECIPE.DEFAULT_TITLE;
}

/**
 * Extracts ingredients list from markdown content.
 * Legacy fallback for edge cases where structured data is incomplete.
 */
export function extractIngredients(content: string): string[] {
  if (!content) return [];
  
  const match = content.match(/##\s*Ingredients\s*\n([\s\S]*?)(?=\n##|\n#|$)/i);
  
  if (!match || !match[1]) return [];
  
  try {
    return match[1]
      .split("\n")
      .map(line => line.trim())
      .filter((line) => line.startsWith("-") || line.startsWith("*"))
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(item => item.length > 0);
  } catch (error) {
    logWarning("Failed to parse ingredients section", {
      error: error instanceof Error ? error.message : String(error),
      contentPreview: match[1].substring(0, 100),
    });
    return [];
  }
}

/**
 * Extracts a specific field value from markdown content.
 * Legacy fallback for edge cases where structured data is incomplete.
 */
export function extractField(content: string, fieldName: string): string {
  if (!content || !fieldName) return "";
  
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`[-*]\\s*${escapedFieldName}\\s*:\\s*(.+?)$`, "im"));
  return match?.[1]?.trim() || "";
}

/**
 * Extracts the servings number from markdown content.
 * Legacy fallback for edge cases where structured data is incomplete.
 */
export function extractServings(content: string): number {
  const DEFAULT_SERVINGS = 4;
  if (!content) return DEFAULT_SERVINGS;
  
  const match = content.match(/[-*]\s*Servings?\s*:\s*(\d+)/i);
  const servings = match?.[1] ? parseInt(match[1], 10) : DEFAULT_SERVINGS;
  
  return servings > 0 && servings <= RECIPE.MAX_SERVINGS ? servings : DEFAULT_SERVINGS;
}
