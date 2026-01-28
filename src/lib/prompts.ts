import { SerializableUserProfile } from "./schemas/user";

/**
 * AI prompt construction utilities.
 * Centralized prompts for consistent AI interactions.
 */

/**
 * Constructs the system prompt for recipe generation based on mode and user preferences.
 * @param isIngredientBased - Whether the recipe should be based on available ingredients
 * @param userProfile - Optional user profile with dietary restrictions and preferences
 * @returns Formatted system prompt for the AI
 */
export function getRecipeSystemPrompt(
  isIngredientBased: boolean,
  userProfile?: SerializableUserProfile | null
): string {
  const preferences = buildUserPreferencesLines(userProfile);
  const modeInstructions = isIngredientBased
    ? "The user will provide a list of ingredients they have. Suggest a recipe that uses these ingredients, adding only common pantry staples if necessary."
    : "The user will describe what they want to eat.";

  const preferencesSection = preferences.length > 0
    ? `Consider the following user preferences:\n${preferences.join("\n")}`
    : "No specific user preferences provided.";

  return `You are a professional chef and recipe expert. Create a delicious recipe based on the user's request.
  
${preferencesSection}

Adjust recipe complexity based on cooking experience.

Allergen handling rules:
- Only avoid allergens that are explicitly listed under "Allergies (MUST AVOID)" above.
- Do not proactively remove/replace common allergens (e.g. peanuts, dairy, gluten) unless they appear in the user's listed allergies.
- If the user explicitly asks for an ingredient that is a common allergen (e.g. "peanut butter"), include it as requested unless it conflicts with the user's listed allergies.

${modeInstructions}

Generate the response as a structured JSON object matching the schema.
If a numeric or nutrition field is unknown, set it to null (do not omit keys).`;
}

/**
 * Builds user preferences lines for the prompt.
 * @returns Array of preference strings (empty array if no preferences)
 */
function buildUserPreferencesLines(
  userProfile?: SerializableUserProfile | null
): string[] {
  if (!userProfile) return [];

  const lines: string[] = [];

  if (userProfile.dietary?.length) {
    lines.push(`Dietary Requirements: ${userProfile.dietary.join(", ")}`);
  }

  if (userProfile.allergies?.length) {
    lines.push(`Allergies (MUST AVOID): ${userProfile.allergies.join(", ")}`);
  }

  if (userProfile.dislikedIngredients?.length) {
    lines.push(`Disliked Ingredients (avoid if possible): ${userProfile.dislikedIngredients.join(", ")}`);
  }

  if (userProfile.preferredCuisines?.length) {
    lines.push(`Preferred Cuisines: ${userProfile.preferredCuisines.join(", ")}`);
  }

  if (userProfile.servingSize) {
    lines.push(`Default Serving Size: ${userProfile.servingSize} people`);
  }

  if (userProfile.cookingExperience) {
    lines.push(`Cooking Experience: ${userProfile.cookingExperience}`);
  }

  return lines;
}
