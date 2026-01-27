import { ParsedRecipe } from "@/lib/schemas";

export type Mode = "specific" | "ingredients" | null;

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
