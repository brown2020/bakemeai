import { z } from "zod";

/**
 * Zod schemas for runtime validation of Firestore data.
 * Ensures type safety and data integrity across the application.
 */

export const recipeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  createdAt: z.number(),
  ingredients: z.array(z.string()),
  preparationTime: z.string(),
  cookingTime: z.string(),
  servings: z.number().int().positive(),
  cuisine: z.string().optional(),
  difficulty: z.string().optional(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  dietary: z.array(z.string()),
  allergies: z.array(z.string()),
  dislikedIngredients: z.array(z.string()),
  cookingExperience: z.enum(["beginner", "intermediate", "advanced"]),
  servingSize: z.number().int().min(1).max(12),
  preferredCuisines: z.array(z.string()),
  updatedAt: z.any().optional(), // Firestore Timestamp
  updatedAtString: z.string().optional(),
});

export const recipeStructureSchema = z.object({
  title: z.string().optional(),
  preparationTime: z.string().optional(),
  cookingTime: z.string().optional(),
  servings: z.number().optional(),
  difficulty: z.enum(["Easy", "Moderate", "Advanced"]).optional(),
  ingredients: z.array(z.string()).optional(),
  instructions: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
  calories: z.number().nullable().optional(),
  macros: z
    .object({
      protein: z.string().nullable(),
      carbs: z.string().nullable(),
      fat: z.string().nullable(),
    })
    .nullable()
    .optional(),
});

// Input schema for profile updates (without server-generated fields)
export const userProfileInputSchema = userProfileSchema.omit({
  id: true,
  updatedAt: true,
  updatedAtString: true,
});

// Form validation schemas
export const emailSchema = z.string().email("Invalid email address");
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const recipeInputSchema = z.object({
  specificInput: z
    .string()
    .min(3, "Please describe what you'd like to make (at least 3 characters)")
    .max(500, "Description is too long (max 500 characters)"),
  ingredientsInput: z
    .string()
    .min(3, "Please list at least one ingredient")
    .max(1000, "Ingredients list is too long (max 1000 characters)"),
});

// Type exports for use across the app
export type Recipe = z.infer<typeof recipeSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserProfileInput = z.infer<typeof userProfileInputSchema>;
export type RecipeStructure = z.infer<typeof recipeStructureSchema>;
