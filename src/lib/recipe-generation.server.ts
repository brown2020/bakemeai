"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { SerializableUserProfile } from "./schemas";
import { getRecipeSystemPrompt } from "./prompts";

/**
 * Schema for AI-generated recipe structure.
 * Different from the stored recipe schema - this is specifically for OpenAI streaming responses.
 * 
 * Note: Uses .describe() for each field to provide context to the AI model.
 * This is only needed for AI-facing schemas; validation-only schemas don't need descriptions.
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
    system: getRecipeSystemPrompt(isIngredientBased, userProfile),
    prompt: prompt,
    temperature: 0,
  });

  const stream = createStreamableValue(result.partialObjectStream);
  return stream.value;
}
