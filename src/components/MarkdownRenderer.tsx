import { memo, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import {
  sanitizeMarkdown,
  MARKDOWN_DISALLOWED_ELEMENTS,
} from "@/lib/utils/sanitize";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Shared markdown renderer with consistent styling and security for recipes.
 * Used in RecipeDisplay and SavedRecipes pages.
 * 
 * Security features:
 * - Pre-sanitizes content to remove dangerous HTML/scripts
 * - Disallows dangerous elements (script, iframe, etc.)
 * - Defense-in-depth approach with multiple layers
 * 
 * Memoization rationale:
 * - ReactMarkdown is expensive (parses markdown and renders complex DOM)
 * - Content rarely changes once rendered (only on new recipe generation)
 * - Prevents re-parsing when parent re-renders for other state changes
 * - Critical for smooth UX during streaming recipe generation
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className = "prose prose-sm sm:prose-base max-w-none",
}: MarkdownRendererProps) {
  // Sanitize content before rendering for additional security
  const sanitizedContent = sanitizeMarkdown(content);

  return (
    <div className={className}>
      <ReactMarkdown
        components={markdownComponents}
        disallowedElements={MARKDOWN_DISALLOWED_ELEMENTS}
        unwrapDisallowed={true}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
});

/**
 * Consistent markdown component styling across the app.
 */
export const markdownComponents = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-3 sm:mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="text-base sm:text-lg font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">
      {children}
    </h2>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc pl-6 space-y-2">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal pl-6 space-y-2">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="ml-2">{children}</li>
  ),
};

