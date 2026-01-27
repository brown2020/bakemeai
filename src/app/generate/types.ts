import { FormEvent } from "react";
import { ParsedRecipe } from "@/lib/schemas";

/**
 * Recipe generation modes.
 * Using const assertion for type safety while maintaining string literal types.
 */
export const GENERATION_MODE = {
  SPECIFIC: "specific",
  INGREDIENTS: "ingredients",
} as const;

export type GenerationMode = typeof GENERATION_MODE[keyof typeof GENERATION_MODE];
export type Mode = GenerationMode | null;

export interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isTextArea?: boolean;
}

export interface ModeSelectorProps {
  onSelectMode: (mode: Mode) => void;
}

export interface ModeCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export interface RecipeFormProps {
  mode: Mode;
  onBack: () => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  input: string;
  onInputChange: (value: string) => void;
  ingredients: string;
  onIngredientsChange: (value: string) => void;
}

export interface RecipeDisplayProps {
  parsedRecipe: ParsedRecipe;
  onSave: () => void;
  isSaving: boolean;
  saved: boolean;
  isGenerating: boolean;
  saveError: string;
}

export interface ErrorMessageProps {
  message: string;
}
