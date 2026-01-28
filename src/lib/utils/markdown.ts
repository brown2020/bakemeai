import { RecipeStructure } from "../schemas/recipe";
import { RECIPE } from "../constants/ui";

/**
 * Markdown utilities for recipe content.
 * Combines conversion (structured → markdown) and parsing (markdown → structured).
 */

// ============================================================================
// CONVERSION: Structured Data → Markdown
// ============================================================================

/**
 * Converts structured recipe to full markdown (title + body).
 * Composes title with body from buildMarkdownBody().
 * @returns Empty string if recipe has no title
 */
export function convertToMarkdown(recipe: RecipeStructure): string {
  if (!recipe.title) return "";
  
  // Simple string concatenation - buildMarkdownBody handles section assembly
  return `# ${recipe.title}\n${buildMarkdownBody(recipe)}`;
}

/**
 * Builds markdown body (everything except title).
 * Used when title is rendered separately.
 */
export function buildMarkdownBody(recipe: RecipeStructure): string {
  const sections: string[] = [];

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

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const ingredientsList = recipe.ingredients
      .map((ing) => `- ${ing}`)
      .join("\n");
    sections.push(`\n## Ingredients\n${ingredientsList}\n`);
  }

  if (recipe.instructions && recipe.instructions.length > 0) {
    const instructionsList = recipe.instructions
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n");
    sections.push(`\n## Instructions\n${instructionsList}\n`);
  }

  if (recipe.tips && recipe.tips.length > 0) {
    const tipsList = recipe.tips
      .map((tip) => `- ${tip}`)
      .join("\n");
    sections.push(`\n## Tips\n${tipsList}\n`);
  }

  return sections.join("");
}

// ============================================================================
// PARSING: Markdown → Structured Data (Emergency Fallbacks)
// ============================================================================

/**
 * IMPORTANT: These parsing functions are emergency fallbacks only.
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
