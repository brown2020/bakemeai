import { z } from "zod";

/**
 * Form and input validation schemas.
 * 
 * Organization:
 * - Authentication validation
 * - Recipe input validation
 */

// ============================================================================
// AUTHENTICATION VALIDATION
// ============================================================================

export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

// ============================================================================
// RECIPE INPUT VALIDATION
// ============================================================================

export const specificRecipeInputSchema = z
  .string()
  .trim()
  .min(3, "Please describe what you'd like to make (at least 3 characters)")
  .max(500, "Description is too long (max 500 characters)");

export const ingredientsRecipeInputSchema = z
  .string()
  .trim()
  .min(3, "Please list at least one ingredient (at least 3 characters)")
  .max(1000, "Ingredients list is too long (max 1000 characters)");
