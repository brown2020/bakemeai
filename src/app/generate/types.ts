import { UserProfile } from "@/lib/types";
import { ReactNode } from "react";

export type Mode = "specific" | "ingredients" | null;

export interface ParsedRecipe {
  title: string;
  content: string;
}

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
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ingredients: string;
  setIngredients: (value: string) => void;
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

export interface ProviderProps {
  children: ReactNode;
}

export interface RecipeGenerationContextType {
  recipe: string;
  setRecipe: (recipe: string) => void;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  parsedRecipe: ParsedRecipe;
  generateRecipeContent: (
    prompt: string,
    isIngredientsMode: boolean,
    userProfile: UserProfile | null
  ) => Promise<void>;
  resetRecipe: () => void;
  userProfile: UserProfile | null;
}

export interface RecipeSavingContextType {
  isSaving: boolean;
  saveError: string;
  saved: boolean;
  saveRecipeToDb: (recipe: string) => Promise<void>;
  resetSaveState: () => void;
}
