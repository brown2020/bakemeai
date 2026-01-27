import { RecipeStructure } from "../schemas";

/**
 * Markdown parsing and conversion utilities for recipe content.
 */

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
 */
export function extractTitle(content: string): string {
  const match = content.match(/^# (.*)$/m);
  return match ? match[1].trim() : "New Recipe";
}

/**
 * Extracts ingredients list from markdown content.
 * Fallback function used when structured data is unavailable.
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
 * Fallback function used when structured data is unavailable.
 */
export function extractField(content: string, fieldName: string): string {
  const match = content.match(new RegExp(`- ${fieldName}: (.*)`));
  return match?.[1] || "";
}

/**
 * Extracts the servings number from markdown content.
 * Fallback function used when structured data is unavailable.
 */
export function extractServings(content: string): number {
  const match = content.match(/- Servings: (\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
