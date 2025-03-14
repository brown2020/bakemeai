import {
  useState,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import { generateRecipe } from "@/lib/actions";
import { readStreamableValue } from "ai/rsc";
import { UserProfile } from "@/lib/types";
import {
  ParsedRecipe,
  RecipeGenerationContextType,
  ProviderProps,
} from "../types";
import { useUserProfile } from "./useUserProfile";

// Utility function
function parseRecipeContent(content: string): ParsedRecipe {
  if (!content) return { title: "", content: "" };

  const jsonMatch = content.match(/^{.*}/);
  if (jsonMatch) {
    try {
      const titleObj = JSON.parse(jsonMatch[0]);
      const cleanContent = content.replace(/^{.*}\n\n/, "");
      return {
        title: titleObj.title || "",
        content: cleanContent,
      };
    } catch (e) {
      console.error("Failed to parse recipe JSON:", e);
    }
  }
  return {
    title: "",
    content,
  };
}

// Create context
const RecipeGenerationContext =
  createContext<RecipeGenerationContextType | null>(null);

export function RecipeGenerationProvider({ children }: ProviderProps) {
  const [recipe, setRecipe] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userProfile } = useUserProfile();

  const parsedRecipe = useMemo(() => parseRecipeContent(recipe), [recipe]);

  const generateRecipeContent = useCallback(
    async (
      prompt: string,
      isIngredientsMode: boolean,
      userProfile: UserProfile | null
    ) => {
      setIsLoading(true);
      setIsGenerating(true);
      setRecipe("");
      setError(null);

      try {
        const result = await generateRecipe(
          prompt,
          isIngredientsMode,
          userProfile
        );

        for await (const content of readStreamableValue(result)) {
          if (content) {
            setRecipe(content.trim());
          }
        }
      } catch (error) {
        console.error("Error generating recipe:", error);
        setError("Failed to generate recipe. Please try again.");
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
      }
    },
    []
  );

  const resetRecipe = useCallback(() => {
    setRecipe("");
    setError(null);
  }, []);

  const value = {
    recipe,
    setRecipe,
    isLoading,
    isGenerating,
    error,
    parsedRecipe,
    generateRecipeContent,
    resetRecipe,
    userProfile,
  };

  return (
    <RecipeGenerationContext.Provider value={value}>
      {children}
    </RecipeGenerationContext.Provider>
  );
}

export function useRecipeGeneration() {
  const context = useContext(RecipeGenerationContext);

  if (!context) {
    throw new Error(
      "useRecipeGeneration must be used within a RecipeGenerationProvider"
    );
  }

  return context;
}
