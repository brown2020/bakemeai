"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { SerializableUserProfile } from "./schemas";

/**
 * Schema for AI-generated recipe structure.
 * Different from the stored recipe schema - this is specifically for OpenAI streaming responses.
 */
const recipeGenerationSchema = z
  .object({
  title: z.string().describe("The title of the recipe"),
  preparationTime: z.string().describe("Time needed for preparation (e.g. '15 mins')"),
  cookingTime: z.string().describe("Time needed for cooking (e.g. '45 mins')"),
  servings: z.number().describe("Number of people served"),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).describe("Difficulty level"),
  ingredients: z.array(z.string()).describe("List of ingredients with measurements"),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
  tips: z.array(z.string()).describe("Helpful cooking tips"),
  // NOTE: OpenAI Responses API JSON schema requires `required` to include *every* key in `properties`.
  // To keep fields "optional" while satisfying that constraint, we make them required-but-nullable.
  calories: z
    .number()
    .nullable()
    .describe("Approximate calories per serving (use null if unknown)"),
  macros: z
    .object({
      protein: z.string().nullable().describe("Protein per serving (use null if unknown)"),
      carbs: z.string().nullable().describe("Carbs per serving (use null if unknown)"),
      fat: z.string().nullable().describe("Fat per serving (use null if unknown)"),
    })
    .strict()
    .nullable()
    .describe("Macronutrients per serving (use null if unknown)"),
  })
  // OpenAI strict schema requires `additionalProperties: false` for objects.
  .strict();

const getSystemPrompt = (
  isIngredientBased: boolean,
  userProfile?: SerializableUserProfile | null
) => {
  // Build dietary restrictions and preferences
  const dietaryInfo = userProfile?.dietary?.length
    ? `\nDietary Requirements: ${userProfile.dietary.join(", ")}`
    : "";

  const allergiesInfo = userProfile?.allergies?.length
    ? `\nAllergies (MUST AVOID): ${userProfile.allergies.join(", ")}`
    : "";

  const dislikedInfo = userProfile?.dislikedIngredients?.length
    ? `\nDisliked Ingredients (avoid if possible): ${userProfile.dislikedIngredients.join(
        ", "
      )}`
    : "";

  const cuisinePrefs = userProfile?.preferredCuisines?.length
    ? `\nPreferred Cuisines: ${userProfile.preferredCuisines.join(", ")}`
    : "";

  const servingSize = userProfile?.servingSize
    ? `\nDefault Serving Size: ${userProfile.servingSize} people`
    : "";

  const experienceLevel = userProfile?.cookingExperience
    ? `\nCooking Experience: ${userProfile.cookingExperience}`
    : "";

  const userPreferences = `${dietaryInfo}${allergiesInfo}${dislikedInfo}${cuisinePrefs}${servingSize}${experienceLevel}`;

  return `You are a professional chef and recipe expert. Create a delicious recipe based on the user's request.
  
Consider the following user preferences:${userPreferences}

Adjust recipe complexity based on cooking experience.

Allergen handling rules:
- Only avoid allergens that are explicitly listed under "Allergies (MUST AVOID)" above.
- Do not proactively remove/replace common allergens (e.g. peanuts, dairy, gluten) unless they appear in the user's listed allergies.
- If the user explicitly asks for an ingredient that is a common allergen (e.g. "peanut butter"), include it as requested unless it conflicts with the user's listed allergies.
${isIngredientBased ? "The user will provide a list of ingredients they have. Suggest a recipe that uses these ingredients, adding only common pantry staples if necessary." : "The user will describe what they want to eat."}

Generate the response as a structured JSON object matching the schema.
If a numeric or nutrition field is unknown, set it to null (do not omit keys).`;
};

/**
 * Generates a recipe using AI based on user input and preferences.
 * @param prompt - The user's recipe request
 * @param isIngredientBased - Whether the request is ingredient-based or specific dish
 * @param userProfile - Optional user profile with dietary restrictions and preferences (must be serializable)
 * @returns Streamable value containing the generated recipe
 */
export async function generateRecipe(
  prompt: string,
  isIngredientBased: boolean,
  userProfile?: SerializableUserProfile | null
) {
  const result = streamObject({
    model: openai("gpt-5.1-chat-latest"),
    schema: recipeGenerationSchema,
    system: getSystemPrompt(isIngredientBased, userProfile),
    prompt: prompt,
    temperature: 0,
  });

  const stream = createStreamableValue(result.partialObjectStream);
  return stream.value;
}
