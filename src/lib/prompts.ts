import { SerializableUserProfile } from "./schemas";

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
  const userPreferencesSection = buildUserPreferencesSection(userProfile);
  const modeInstructions = isIngredientBased
    ? "The user will provide a list of ingredients they have. Suggest a recipe that uses these ingredients, adding only common pantry staples if necessary."
    : "The user will describe what they want to eat.";

  return `You are a professional chef and recipe expert. Create a delicious recipe based on the user's request.
  
Consider the following user preferences:${userPreferencesSection}

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
 * Builds the user preferences section of the prompt.
 * Only includes sections where the user has provided information.
 * @param userProfile - User profile with preferences
 * @returns Formatted preferences string for the prompt (empty or starts with newline)
 */
function buildUserPreferencesSection(
  userProfile?: SerializableUserProfile | null
): string {
  if (!userProfile) return "";

  const sections: string[] = [];

  if (userProfile.dietary?.length) {
    sections.push(`Dietary Requirements: ${userProfile.dietary.join(", ")}`);
  }

  if (userProfile.allergies?.length) {
    sections.push(
      `Allergies (MUST AVOID): ${userProfile.allergies.join(", ")}`
    );
  }

  if (userProfile.dislikedIngredients?.length) {
    sections.push(
      `Disliked Ingredients (avoid if possible): ${userProfile.dislikedIngredients.join(", ")}`
    );
  }

  if (userProfile.preferredCuisines?.length) {
    sections.push(
      `Preferred Cuisines: ${userProfile.preferredCuisines.join(", ")}`
    );
  }

  if (userProfile.servingSize) {
    sections.push(`Default Serving Size: ${userProfile.servingSize} people`);
  }

  if (userProfile.cookingExperience) {
    sections.push(`Cooking Experience: ${userProfile.cookingExperience}`);
  }

  // Join with newlines and prepend a newline if we have content
  return sections.length > 0 ? "\n" + sections.join("\n") : "";
}
