import { RecipeStructure } from "../schemas";
import { RECIPE } from "../constants/ui";
import { logWarning } from "./logger";

/**
 * Markdown parsing and conversion utilities for recipe content.
 */

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
 * Legacy fallback for edge cases where structured data is incomplete.
 */
export function extractTitle(content: string): string {
  if (!content) return RECIPE.DEFAULT_TITLE;
  
  // Extract H1 markdown syntax (# Title)
  const h1Match = content.match(/^#\s+(.+?)$/m);
  return h1Match?.[1]?.trim() ?? RECIPE.DEFAULT_TITLE;
}

/**
 * Extracts ingredients list from markdown content.
 * Legacy fallback for edge cases where structured data is incomplete.
 */
export function extractIngredients(content: string): string[] {
  if (!content) return [];
  
  // Match Ingredients section heading with flexible spacing/casing
  const match = content.match(/##\s*Ingredients\s*\n([\s\S]*?)(?=\n##|\n#|$)/i);
  
  if (!match || !match[1]) return [];
  
  try {
    // Extract list items, supporting both "- " and "* " markdown list syntax
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
