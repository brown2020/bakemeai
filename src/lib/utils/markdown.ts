import { RecipeStructure } from "../schemas";
import { RECIPE } from "../constants/ui";
import { logWarning } from "./logger";

/**
 * Markdown parsing and conversion utilities for recipe content.
 */

/**
 * Generic markdown section extractor.
 * Eliminates duplication by providing a flexible extraction pattern.
 * 
 * @template T - The type of data to extract from the section
 * @param content - The markdown content to parse
 * @param sectionName - The heading name (e.g., "Ingredients", "Instructions")
 * @param parser - Function to parse the extracted section content
 * @returns Parsed section data or null if section not found or parsing fails
 * 
 * @example
 * const ingredients = extractMarkdownSection(
 *   markdown,
 *   "Ingredients",
 *   (text) => text.split("\n").filter(line => line.startsWith("-"))
 * );
 */
function extractMarkdownSection<T>(
  content: string,
  sectionName: string,
  parser: (text: string) => T
): T | null {
  if (!content || !sectionName) return null;
  
  // Match section heading with flexible spacing/casing
  const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(
    new RegExp(`##\\s*${escapedName}\\s*\\n([\\s\\S]*?)(?=\\n##|\\n#|$)`, "i")
  );
  
  if (!match || !match[1]) return null;
  
  try {
    return parser(match[1]);
  } catch (error) {
    // Log parsing failures in development to help debug markdown extraction issues
    logWarning(`Failed to parse markdown section: ${sectionName}`, {
      error: error instanceof Error ? error.message : String(error),
      contentPreview: match[1].substring(0, 100),
    });
    return null;
  }
}

/**
 * Converts a structured recipe object to markdown format.
 * Used for displaying AI-generated recipes in a readable format.
 * 
 * Format includes:
 * - Title (H1)
 * - Recipe details (preparation time, cooking time, servings, difficulty, calories)
 * - Ingredients (bulleted list)
 * - Instructions (numbered list)
 * - Tips (bulleted list, optional)
 * 
 * @param recipe - Structured recipe data from AI generation
 * @returns Formatted markdown string, or empty string if recipe has no title
 */
export function convertToMarkdown(recipe: RecipeStructure): string {
  if (!recipe.title) return "";

  const sections: string[] = [];
  
  // Title
  sections.push(`# ${recipe.title}\n`);

  // Recipe Details
  const details: string[] = [];
  if (recipe.preparationTime) {
    details.push(`- Preparation Time: ${recipe.preparationTime}`);
  }
  if (recipe.cookingTime) {
    details.push(`- Cooking Time: ${recipe.cookingTime}`);
  }
  if (recipe.servings) {
    details.push(`- Servings: ${recipe.servings}`);
  }
  if (recipe.difficulty) {
    details.push(`- Difficulty: ${recipe.difficulty}`);
  }
  if (recipe.calories != null) {
    details.push(`- Calories: ${recipe.calories} kcal`);
  }
  
  if (details.length > 0) {
    sections.push(`# Recipe Details\n${details.join("\n")}\n`);
  }

  // Ingredients
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const ingredientsList = recipe.ingredients
      .map((ing) => `- ${ing}`)
      .join("\n");
    sections.push(`\n## Ingredients\n${ingredientsList}\n`);
  }

  // Instructions
  if (recipe.instructions && recipe.instructions.length > 0) {
    const instructionsList = recipe.instructions
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n");
    sections.push(`\n## Instructions\n${instructionsList}\n`);
  }

  // Tips (optional)
  if (recipe.tips && recipe.tips.length > 0) {
    const tipsList = recipe.tips
      .map((tip) => `- ${tip}`)
      .join("\n");
    sections.push(`\n## Tips\n${tipsList}\n`);
  }

  return sections.join("");
}

/**
 * Extracts the title from markdown content.
 * Fallback function used when structured data is unavailable.
 * Handles multiple heading formats and edge cases.
 */
export function extractTitle(content: string): string {
  if (!content) return RECIPE.DEFAULT_TITLE;
  
  // Try H1 markdown syntax first (# Title)
  const h1Match = content.match(/^#\s+(.+?)$/m);
  if (h1Match && h1Match[1]) {
    return h1Match[1].trim();
  }
  
  // Fallback: try to find any heading-like text at the start
  const firstLine = content.split("\n")[0]?.trim();
  if (firstLine && firstLine.length > 0 && firstLine.length < RECIPE.MAX_TITLE_LENGTH) {
    return firstLine.replace(/^#+\s*/, "").trim() || RECIPE.DEFAULT_TITLE;
  }
  
  return RECIPE.DEFAULT_TITLE;
}

/**
 * Extracts ingredients list from markdown content.
 * Fallback function used when structured data is unavailable.
 * Uses generic extraction helper for cleaner implementation.
 */
export function extractIngredients(content: string): string[] {
  return extractMarkdownSection(content, "Ingredients", (text) => {
    // Extract list items, supporting both "- " and "* " markdown list syntax
    return text
      .split("\n")
      .map(line => line.trim())
      .filter((line) => line.startsWith("-") || line.startsWith("*"))
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(item => item.length > 0);
  }) ?? [];
}

/**
 * Extracts a specific field value from markdown content.
 * Fallback function used when structured data is unavailable.
 * Uses case-insensitive matching and handles variations in spacing.
 */
export function extractField(content: string, fieldName: string): string {
  if (!content || !fieldName) return "";
  
  // Escape special regex characters in fieldName and use case-insensitive matching
  const escapedFieldName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`[-*]\\s*${escapedFieldName}\\s*:\\s*(.+?)$`, "im"));
  return match?.[1]?.trim() || "";
}

/**
 * Extracts the servings number from markdown content.
 * Fallback function used when structured data is unavailable.
 * Uses robust parsing with validation and default fallback.
 * Returns 4 as default when extraction fails (consistent with extractTitle returning fallback).
 */
export function extractServings(content: string): number {
  const DEFAULT_SERVINGS = 4;
  if (!content) return DEFAULT_SERVINGS;
  
  // Case-insensitive match with flexible spacing
  const match = content.match(/[-*]\s*Servings?\s*:\s*(\d+)/i);
  if (!match || !match[1]) return DEFAULT_SERVINGS;
  
  const servings = parseInt(match[1], 10);
  // Validate reasonable serving size range
  return servings > 0 && servings <= RECIPE.MAX_SERVINGS ? servings : DEFAULT_SERVINGS;
}
