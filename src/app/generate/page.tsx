"use client";

import { useState, useMemo, useEffect } from "react";
import { useChat } from "ai/react";
import { generateRecipe } from "@/lib/actions";
import { readStreamableValue } from "ai/rsc";
import ReactMarkdown from "react-markdown";
import { saveRecipe, getUserProfile } from "@/lib/db";
import { auth } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import PageLayout from "@/components/PageLayout";
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
        setUserProfile(profile);
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

      const result = await generateRecipe(
        prompt,
        mode === "ingredients",
        userProfile
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
    <PageLayout
      title="Generate Recipe"
      subtitle="Create personalized recipes tailored to your preferences"
    >
      <div className="space-y-8 animate-slide-up">
        {!mode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setMode("specific")}
              className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-surface-200 hover:border-primary-300"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-primary-600">
                I want to make something specific
              </h2>
              <p className="text-gray-600">
                Get a recipe for a particular dish you have in mind
              </p>
            </button>

            <button
              onClick={() => setMode("ingredients")}
              className="p-6 border rounded-lg hover:border-blue-500 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">
                Suggest something based on ingredients
              </h2>
              <p className="text-gray-600">
                List what you have and get recipe suggestions
              </p>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setMode(null)}
              className="text-primary-600 hover:text-primary-700"
            >
              ← Choose different option
            </Button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-surface-200">
                {mode === "specific" ? (
                  <div>
                    <label className="block text-lg font-medium mb-2">
                      What would you like to make?
                    </label>
                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="e.g., Chocolate chip cookies, Beef stir fry..."
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-lg font-medium mb-2">
                      What ingredients do you have?
                    </label>
                    <textarea
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="e.g., chicken breast, rice, onions, garlic..."
                      className="w-full p-3 border rounded-lg h-32"
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
              <div className="bg-white rounded-xl shadow-md p-8 animate-fade-in">
                <div className="flex justify-between items-start mb-6">
                  {parsedRecipe.title && (
                    <h2 className="text-3xl font-bold">{parsedRecipe.title}</h2>
                  )}
                  <div className="ml-4 flex flex-col items-end">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || saved || isGenerating}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        saved
                          ? "bg-green-100 text-green-800"
                          : isGenerating
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {saved
                        ? "Saved!"
                        : isGenerating
                        ? "Generating..."
                        : isSaving
                        ? "Saving..."
                        : "Save Recipe"}
                    </button>
                    {saveError && (
                      <p className="text-sm text-red-600 mt-2">{saveError}</p>
                    )}
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-semibold mt-6 mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mt-6 mb-3">
                          {children}
                        </h2>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-2">{children}</li>
                      ),
                    }}
                  >
                    {parsedRecipe.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
