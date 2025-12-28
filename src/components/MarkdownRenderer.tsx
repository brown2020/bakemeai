import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Shared markdown renderer with consistent styling for recipes.
 * Used in RecipeDisplay and SavedRecipes pages.
 */
export function MarkdownRenderer({
  content,
  className = "prose prose-sm sm:prose-base max-w-none",
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}

/**
 * Consistent markdown component styling across the app.
 */
export const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base sm:text-lg font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">
      {children}
    </h2>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-6 space-y-2">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-6 space-y-2">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="ml-2">{children}</li>
  ),
};



