import { z } from "zod";

const preferenceTag = z.string().trim().max(200);

function preferenceList(maxItems: number) {
  return z
    .array(preferenceTag)
    .max(maxItems)
    .transform((items) => items.filter((item) => item.length > 0));
}

/**
 * Bounds for profile data copied into the recipe system prompt and written
 * to Firestore. Rules cap how many items a list may hold. Item length is
 * enforced here because unrolling every index does not compile.
 */
export const generationProfileSchema = z.object({
  id: z.string().trim().min(1).max(128).optional(),
  dietary: preferenceList(30),
  allergies: preferenceList(50),
  dislikedIngredients: preferenceList(50),
  preferredCuisines: preferenceList(30),
  cookingExperience: z.enum(["beginner", "intermediate", "advanced"]),
  servingSize: z.number().int().min(1).max(12),
});

export type GenerationProfile = z.infer<typeof generationProfileSchema>;

export function parseGenerationProfile(
  input: unknown
): { ok: true; profile: GenerationProfile | null } | { ok: false } {
  if (input == null) return { ok: true, profile: null };
  const parsed = generationProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  return { ok: true, profile: parsed.data };
}
