import type { SerializableUserProfile } from "./schemas/user";

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
  const sections: string[] = [];

  // 1. Role and objective
  sections.push("You are a professional chef and recipe expert. Create a delicious recipe based on the user's request.");

  // 2. User preferences (if any)
  const preferences = buildUserPreferencesLines(userProfile);
  if (preferences.length > 0) {
    sections.push("");
    sections.push("Consider the following user preferences:");
    sections.push(...preferences);
  } else {
    sections.push("");
    sections.push("No specific user preferences provided.");
  }

  // 3. Experience-based complexity
  sections.push("");
  sections.push("Adjust recipe complexity based on cooking experience.");

  // 4. Allergen handling rules
  sections.push("");
  sections.push("Allergen handling rules:");
  sections.push("- Only avoid allergens that are explicitly listed under \"Allergies (MUST AVOID)\" above.");
  sections.push("- Do not proactively remove/replace common allergens (e.g. peanuts, dairy, gluten) unless they appear in the user's listed allergies.");
  sections.push("- If the user explicitly asks for an ingredient that is a common allergen (e.g. \"peanut butter\"), include it as requested unless it conflicts with the user's listed allergies.");

  // 5. Mode-specific instructions
  sections.push("");
  if (isIngredientBased) {
    sections.push("The user will provide a list of ingredients they have. Suggest a recipe that uses these ingredients, adding only common pantry staples if necessary.");
  } else {
    sections.push("The user will describe what they want to eat.");
  }

  // 6. Output format instructions
  sections.push("");
  sections.push("Generate the response as a structured JSON object matching the schema.");
  sections.push("If a numeric or nutrition field is unknown, set it to null (do not omit keys).");

  return sections.join("\n");
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
