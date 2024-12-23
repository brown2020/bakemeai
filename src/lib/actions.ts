"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { UserProfile } from "./types";

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

  return `You are a professional chef and recipe expert. Consider the following user preferences when creating recipes:${userPreferences}

Adjust recipe complexity based on cooking experience, and strictly avoid any allergens.
First provide a JSON object with the recipe title, then format the rest of your response in markdown.

The JSON should be on a single line like this: {"title": "Recipe Name"}

Then skip a line and continue with the markdown format:

${
  isIngredientBased
    ? `# Suggested Recipes
Based on your ingredients, I recommend:

`
    : ""
}
# Recipe Details
- Preparation Time: 
- Cooking Time: 
- Servings: ${userProfile?.servingSize || "4"}
- Difficulty: ${getDifficultyForExperience(userProfile?.cookingExperience)}

## Ingredients
List all ingredients with measurements

## Instructions
Step-by-step cooking instructions

## Tips
Provide 2-3 helpful cooking tips`;
};

function getDifficultyForExperience(experience?: string) {
  switch (experience) {
    case "beginner":
      return "Easy";
    case "intermediate":
      return "Moderate";
    case "advanced":
      return "Advanced";
    default:
      return "Moderate";
  }
}

export async function generateRecipe(
  prompt: string,
  isIngredientBased: boolean,
  userProfile?: UserProfile | null
) {
  const messages: CoreMessage[] = [
    {
      role: "system",
      content: getSystemPrompt(isIngredientBased, userProfile),
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = streamText({
    model: openai("gpt-4"),
    messages,
    temperature: 0.7,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}
