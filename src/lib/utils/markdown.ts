import { RecipeStructure } from "../schemas";
import { RECIPE } from "../constants/ui";

/**
 * Markdown parsing and conversion utilities for recipe content.
 */

/**
 * Generic markdown section extractor.
 * Eliminates duplication by providing a flexible extraction pattern.
 * @param content - The markdown content to parse
 * @param sectionName - The heading name (e.g., "Ingredients", "Instructions")
 * @param parser - Function to parse the extracted section content
 * @returns Parsed section data
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
  } catch {
    return null;
  }
}

/**
 * Converts a structured recipe object to markdown format.
 * Used for displaying AI-generated recipes in a readable format.
 * @param recipe - Structured recipe data from AI generation
 * @returns Formatted markdown string
 */
export function convertToMarkdown(recipe: RecipeStructure): string {
  if (!recipe.title) return "";

  let markdown = `# ${recipe.title}\n\n`;

  markdown += `# Recipe Details\n`;
  if (recipe.preparationTime)
    markdown += `- Preparation Time: ${recipe.preparationTime}\n`;
  if (recipe.cookingTime) markdown += `- Cooking Time: ${recipe.cookingTime}\n`;
  if (recipe.servings) markdown += `- Servings: ${recipe.servings}\n`;
  if (recipe.difficulty) markdown += `- Difficulty: ${recipe.difficulty}\n`;
  if (recipe.calories != null) markdown += `- Calories: ${recipe.calories} kcal\n`;

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    markdown += `\n## Ingredients\n`;
    recipe.ingredients.forEach((ing) => {
      markdown += `- ${ing}\n`;
    });
  }

  if (recipe.instructions && recipe.instructions.length > 0) {
    markdown += `\n## Instructions\n`;
    recipe.instructions.forEach((step, index) => {
      markdown += `${index + 1}. ${step}\n`;
    });
  }

  if (recipe.tips && recipe.tips.length > 0) {
    markdown += `\n## Tips\n`;
    recipe.tips.forEach((tip) => {
      markdown += `- ${tip}\n`;
    });
  }

  return markdown;
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
 */
export function extractServings(content: string): number {
  if (!content) return 0;
  
  // Case-insensitive match with flexible spacing
  const match = content.match(/[-*]\s*Servings?\s*:\s*(\d+)/i);
  if (!match || !match[1]) return 0;
  
  const servings = parseInt(match[1], 10);
  // Validate reasonable serving size range
  return servings > 0 && servings <= RECIPE.MAX_SERVINGS ? servings : 0;
}
