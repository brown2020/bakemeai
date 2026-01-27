"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { SerializableUserProfile, aiRecipeFields } from "./schemas";
import { getRecipeSystemPrompt } from "./prompts";

/**
 * Schema for AI-generated recipe structure.
 * Uses base recipe fields with .describe() annotations for AI context.
 * OpenAI strict schema requires all fields to be required and additionalProperties: false.
 */
const recipeGenerationSchema = z.object(aiRecipeFields).strict();

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
    model: openai("gpt-4o"),
    schema: recipeGenerationSchema,
    system: getRecipeSystemPrompt(isIngredientBased, userProfile),
    prompt: prompt,
    temperature: 0,
  });

  const stream = createStreamableValue(result.partialObjectStream);
  return stream.value;
}
