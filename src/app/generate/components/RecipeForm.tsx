import { RecipeFormProps } from "../types";
import { Button } from "@/components/Button";
import { FormInput } from "./FormInput";
import { CARD_STYLES } from "../constants";

export function RecipeForm({
  mode,
  onBack,
  onSubmit,
  isLoading,
  input,
  onInputChange,
  ingredients,
  onIngredientsChange,
}: RecipeFormProps) {
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-primary-600 hover:text-primary-700"
      >
        ← Choose different option
      </Button>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className={CARD_STYLES.container}>
          {mode === "specific" ? (
            <FormInput
              label="What would you like to make?"
              placeholder="e.g., Chocolate chip cookies, Beef stir fry..."
              value={input}
              onChange={onInputChange}
            />
          ) : (
            <FormInput
              label="What ingredients do you have?"
              placeholder="e.g., chicken breast, rice, onions, garlic..."
              value={ingredients}
              onChange={onIngredientsChange}
              isTextArea
            />
          )}
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? "Generating..." : "Generate Recipe"}
        </Button>
      </form>
    </div>
  );
}
