// Recipe prompt templates
export const RECIPE_PROMPTS = {
  specific: (input: string) =>
    `Please provide a detailed recipe for: ${input}. Make it easy to follow for home cooks.`,
  ingredients: (ingredients: string) =>
    `I have these ingredients: ${ingredients}. Please suggest a recipe I can make with some or all of these ingredients. Prioritize using as many of the listed ingredients as possible while suggesting common pantry items to complete the recipe if needed.`,
};

// Common styling constants
export const CARD_STYLES = {
  container: "bg-white rounded-lg shadow-xs p-3 border border-surface-200",
  hoverEffect: "hover:border-blue-300 cursor-pointer transition-colors",
  title: "text-base font-medium mb-2",
  description: "text-sm text-gray-600",
};
