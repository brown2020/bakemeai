"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { FORM_VALIDATION } from "@/lib/constants/ui";
import { parseGenerationProfile } from "@/lib/schemas/generation-profile";
import {
  AppError,
  ERROR_MESSAGES,
  convertRecipeGenerationErrorToMessage,
} from "@/lib/utils/error-handler";
import {
  abortGeneration,
  finishGeneration,
  startGeneration,
} from "@/lib/utils/generation-abort";
import { applyGenerationQuota } from "@/lib/utils/generation-quota";
import { logError, logWarning } from "@/lib/utils/logger";
import { requireAuthenticatedUserId, requireGenerationUser } from "@/lib/utils/server-auth";

import { getRecipeSystemPrompt } from "./prompts";

/** Max prompt length — allows wrapped templates over raw input limits. */
const MAX_SERVER_PROMPT_LENGTH = FORM_VALIDATION.TEXTAREA_MAX_LENGTH + 500;

export type RecipeStreamUpdate =
  | { kind: "recipe"; recipe: unknown }
  | { kind: "error"; message: string };

export type GenerateRecipeResult =
  | {
      ok: true;
      generationId: string;
      stream: ReturnType<typeof createStreamableValue<RecipeStreamUpdate>>["value"];
    }
  | { ok: false; message: string; code: string };

function assertOpenAiConfigured(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new AppError(
      ERROR_MESSAGES.RECIPE.GENERATION_UNAVAILABLE,
      "OPENAI_API_KEY_MISSING"
    );
  }
}

function toRecipeGenerationError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  return new AppError(
    convertRecipeGenerationErrorToMessage(error),
    "RECIPE_PROVIDER_ERROR"
  );
}

function generationFailure(error: unknown): GenerateRecipeResult {
  const appError = toRecipeGenerationError(error);
  return {
    ok: false,
    message: appError.message,
    code: appError.code ?? "GENERATION_FAILED",
  };
}

/**
 * Schema for AI-generated recipe structure.
 * Uses .describe() annotations to provide context for the AI model.
 * OpenAI strict schema requires all fields to be required and additionalProperties: false.
 */
const recipeGenerationSchema = z.strictObject({
  title: z.string().describe("The title of the recipe"),
  preparationTime: z.string().describe("Time needed for preparation (e.g. '15 mins')"),
  cookingTime: z.string().describe("Time needed for cooking (e.g. '45 mins')"),
  servings: z.number().describe("Number of people served"),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).describe("Difficulty level"),
  ingredients: z.array(z.string()).describe("List of ingredients with measurements"),
  instructions: z.array(z.string()).describe("Step-by-step cooking instructions"),
  tips: z.array(z.string()).describe("Helpful cooking tips"),
  calories: z.number().nullable().describe("Approximate calories per serving (use null if unknown)"),
  macros: z.strictObject({
    protein: z.string().nullable().describe("Protein per serving (use null if unknown)"),
    carbs: z.string().nullable().describe("Carbs per serving (use null if unknown)"),
    fat: z.string().nullable().describe("Fat per serving (use null if unknown)"),
  }).nullable().describe("Macronutrients per serving (use null if unknown)"),
});

/**
 * Stops an in-flight generation on this server instance.
 * Safe to call after the client aborts; a miss (other instance) is a no-op.
 */
export async function cancelRecipeGeneration(generationId: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(generationId)) return;

  try {
    const userId = await requireAuthenticatedUserId();
    abortGeneration(generationId, userId);
  } catch {
    // Unsigned or missing sessions have nothing they are allowed to cancel.
  }
}

/**
 * Generates a recipe using AI based on user input and preferences.
 * Expected failures are returned as data so production RSC error masking
 * cannot hide auth, quota, and provider messages.
 */
export async function generateRecipe(
  prompt: string,
  isIngredientBased: boolean,
  userProfile?: unknown
): Promise<GenerateRecipeResult> {
  let generationId: string | null = null;
  let ownerId: string | null = null;

  try {
    const user = await requireGenerationUser();
    ownerId = user.uid;

    const trimmedPrompt = prompt.trim();
    if (
      trimmedPrompt.length < FORM_VALIDATION.INPUT_MIN_LENGTH ||
      trimmedPrompt.length > MAX_SERVER_PROMPT_LENGTH
    ) {
      throw new AppError(
        ERROR_MESSAGES.RECIPE.GENERATION_FAILED,
        "INVALID_PROMPT"
      );
    }

    const parsedProfile = parseGenerationProfile(userProfile);
    if (!parsedProfile.ok) {
      throw new AppError(
        ERROR_MESSAGES.RECIPE.INVALID_PREFERENCES,
        "INVALID_PROFILE"
      );
    }

    const quota = await applyGenerationQuota({
      idToken: user.idToken,
      userId: user.uid,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      warn: (message) => logWarning(message, {}),
    });

    if (!quota.allowed) {
      throw new AppError(ERROR_MESSAGES.RECIPE.RATE_LIMIT, "RATE_LIMITED");
    }

    assertOpenAiConfigured();

    const active = startGeneration(user.uid);
    generationId = active.id;

    let partialObjectStream: AsyncIterable<unknown>;
    try {
      const result = streamObject({
        model: openai("gpt-4o"),
        schema: recipeGenerationSchema,
        system: getRecipeSystemPrompt(isIngredientBased, parsedProfile.profile),
        prompt: trimmedPrompt,
        temperature: 0,
        abortSignal: active.controller.signal,
      });
      partialObjectStream = result.partialObjectStream;
    } catch (error) {
      abortGeneration(active.id, user.uid);
      generationId = null;
      logError("Recipe provider failed to start", error, {});
      return generationFailure(error);
    }

    const stream = createStreamableValue<RecipeStreamUpdate>();
    const activeId = active.id;
    const abortSignal = active.controller.signal;

    void (async () => {
      try {
        for await (const partialObject of partialObjectStream) {
          if (abortSignal.aborted) break;
          stream.update({ kind: "recipe", recipe: partialObject });
        }

        if (abortSignal.aborted) {
          try {
            stream.done();
          } catch {
            // The client already stopped reading.
          }
          return;
        }

        stream.done();
      } catch (error) {
        if (!abortSignal.aborted) {
          abortGeneration(activeId, user.uid);
        }

        if (abortSignal.aborted) {
          try {
            stream.done();
          } catch {
            // Already closed.
          }
          return;
        }

        logError("Recipe provider stream failed", error, {});
        try {
          stream.update({
            kind: "error",
            message: toRecipeGenerationError(error).message,
          });
          stream.done();
        } catch {
          // The client disconnected; the provider abort above is the cleanup.
        }
      } finally {
        finishGeneration(activeId);
      }
    })();

    return { ok: true, generationId: active.id, stream: stream.value };
  } catch (error) {
    if (generationId && ownerId) {
      abortGeneration(generationId, ownerId);
    }
    return generationFailure(error);
  }
}
