import { RecipeStructure } from "../schemas";

/**
 * Markdown conversion utilities for recipe content.
 */

/**
 * Converts structured recipe to full markdown (title + body).
 * @returns Empty string if recipe has no title
 */
export function convertToMarkdown(recipe: RecipeStructure): string {
  if (!recipe.title) return "";

  const sections: string[] = [];
  
  sections.push(`# ${recipe.title}\n`);

  const bodyContent = buildMarkdownBody(recipe);
  if (bodyContent) {
    sections.push(bodyContent);
  }

  return sections.join("");
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
