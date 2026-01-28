import { z } from "zod";

/**
 * Authentication validation schemas.
 * 
 * Note: Recipe validation schemas are in schemas/recipe.ts
 */

export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");
