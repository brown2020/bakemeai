"use client";

import { useState, useMemo, useEffect } from "react";
import { useChat } from "ai/react";
import { generateRecipe } from "@/lib/actions";
import { readStreamableValue } from "ai/rsc";
import ReactMarkdown from "react-markdown";
import { saveRecipe, getUserProfile } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { Button } from "@/components/Button";

type Mode = "specific" | "ingredients" | null;

function parseRecipeContent(content: string) {
  const jsonMatch = content.match(/^{.*}/);
  if (jsonMatch) {
    try {
      const titleObj = JSON.parse(jsonMatch[0]);
      const cleanContent = content.replace(/^{.*}\n\n/, "");
      return {
        title: titleObj.title,
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

export default function Generate() {
  const [mode, setMode] = useState<Mode>(null);
  const [ingredients, setIngredients] = useState<string>("");
  const [recipe, setRecipe] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { input, handleInputChange } = useChat();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const parsedRecipe = useMemo(() => parseRecipeContent(recipe), [recipe]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!auth.currentUser) return;
      try {
        const profile = await getUserProfile(auth.currentUser.uid);

        if (profile && profile.updatedAt) {
          setUserProfile({
            ...profile,
            updatedAtString: profile.updatedAt.seconds
              ? new Date(profile.updatedAt.seconds * 1000).toISOString()
              : undefined, // Store as separate string field
          });
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsGenerating(true);
    setRecipe("");
    setSaved(false);

    try {
      const prompt =
        mode === "specific"
          ? `Please provide a detailed recipe for: ${input}. Make it easy to follow for home cooks.`
          : `I have these ingredients: ${ingredients}. Please suggest a recipe I can make with some or all of these ingredients. Prioritize using as many of the listed ingredients as possible while suggesting common pantry items to complete the recipe if needed.`;

      // Ensure `updatedAt` is removed or converted before passing userProfile
      const sanitizedUserProfile = userProfile
        ? {
            ...userProfile,
            updatedAt: undefined, // Remove Firestore timestamp
          }
        : null;

      const result = await generateRecipe(
        prompt,
        mode === "ingredients",
        sanitizedUserProfile
      );
      for await (const content of readStreamableValue(result)) {
        if (content) {
          setRecipe(content.trim());
        }
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    setSaveError("");

    try {
      await saveRecipe(auth.currentUser.uid, recipe);
      setSaved(true);
    } catch (error) {
      console.error("Error saving recipe:", error);
      setSaveError("Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  // Clear recipe when mode changes
  useEffect(() => {
    setRecipe("");
  }, [mode]);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Generate Recipe</h1>
        </div>

        <div className="space-y-6">
          {!mode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="bg-white rounded-lg shadow-xs p-3 border border-surface-200 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => setMode("specific")}
              >
                <h2 className="text-base font-medium mb-2">
                  I want to make something specific
                </h2>
                <p className="text-sm text-gray-600">
                  Get a recipe for a particular dish you have in mind
                </p>
              </div>

              <div
                className="bg-white rounded-lg shadow-xs p-3 border border-surface-200 hover:border-blue-300 cursor-pointer transition-colors"
                onClick={() => setMode("ingredients")}
              >
                <h2 className="text-base font-medium mb-2">
                  Suggest something based on ingredients
                </h2>
                <p className="text-sm text-gray-600">
                  List what you have and get recipe suggestions
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setMode(null)}
                className="text-primary-600 hover:text-primary-700"
              >
                ← Choose different option
              </Button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-white rounded-lg shadow-xs p-3 border border-surface-200">
                  {mode === "specific" ? (
                    <div>
                      <label className="block text-base font-medium mb-2">
                        What would you like to make?
                      </label>
                      <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="e.g., Chocolate chip cookies, Beef stir fry..."
                        className="w-full p-2 border rounded-lg"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-base font-medium mb-2">
                        What ingredients do you have?
                      </label>
                      <textarea
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        placeholder="e.g., chicken breast, rice, onions, garlic..."
                        className="w-full p-2 border rounded-lg h-32"
                        required
                      />
                    </div>
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

              {recipe && (
                <div className="bg-white rounded-lg shadow-xs p-3 border border-surface-200">
                  <h2 className="text-base font-medium">
                    {parsedRecipe.title}
                  </h2>
                  <div className="prose prose-sm mt-4">
                    <ReactMarkdown>{parsedRecipe.content}</ReactMarkdown>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || saved || isGenerating}
                  >
                    {saved ? "Saved!" : isSaving ? "Saving..." : "Save Recipe"}
                  </Button>
                  {saveError && (
                    <p className="text-sm text-red-600 mt-2">{saveError}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
