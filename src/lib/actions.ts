"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { UserProfile } from "./types";

// Define the schema for the recipe structure
const recipeSchema = z.object({
  title: z.string().describe("The title of the recipe"),
  preparationTime: z.string().describe("Time needed for preparation (e.g. '15 mins')"),
  cookingTime: z.string().describe("Time needed for cooking (e.g. '45 mins')"),
  servings: z.number().describe("Number of people served"),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).describe("Difficulty level"),
  ingredients: z.array(z.string()).describe("List of ingredients with measurements"),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
  tips: z.array(z.string()).describe("Helpful cooking tips"),
  calories: z.number().optional().describe("Approximate calories per serving"),
  macros: z.object({
    protein: z.string().optional(),
    carbs: z.string().optional(),
    fat: z.string().optional(),
  }).optional().describe("Macronutrients per serving"),
});

const getSystemPrompt = (
  isIngredientBased: boolean,
  userProfile?: UserProfile | null
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

Adjust recipe complexity based on cooking experience, and strictly avoid any allergens.
${isIngredientBased ? "The user will provide a list of ingredients they have. Suggest a recipe that uses these ingredients, adding only common pantry staples if necessary." : "The user will describe what they want to eat."}

Generate the response as a structured JSON object matching the schema.`;
};

export async function generateRecipe(
  prompt: string,
  isIngredientBased: boolean,
  userProfile?: UserProfile | null
) {
  const result = streamObject({
    model: openai("gpt-5.1-chat-latest"),
    schema: recipeSchema,
    system: getSystemPrompt(isIngredientBased, userProfile),
    prompt: prompt,
    temperature: 0,
  });

  const stream = createStreamableValue(result.partialObjectStream);
  return stream.value;
}
