import { RecipeStructure, ParsedRecipe } from "@/lib/schemas/recipe";
import { convertToMarkdown, buildMarkdownBody } from "@/lib/utils/markdown";

/**
 * Recipe store selectors - pure functions for deriving data from store state.
 * 
 * PATTERN: Selectors as pure functions
 * - Take state as input, return derived value
 * - No side effects, no mutations
 * - Can be tested independently of store
 * - Clear separation: selectors compute, store holds state
 * 
 * USAGE:
 * const { structuredRecipe } = useRecipeStore();
 * const recipe = selectDisplayRecipe(structuredRecipe);
 */

/**
 * Converts structured recipe to display format for UI rendering.
 * Returns recipe with title and markdown body for rendering.
 * 
 * @param structuredRecipe - The structured recipe data from store
 * @returns Parsed recipe for display, or null if no recipe available
 */
export function selectDisplayRecipe(
  structuredRecipe: RecipeStructure | null
): ParsedRecipe | null {
  if (!structuredRecipe) {
    return null;
  }
  
  const title = structuredRecipe.title ?? "";
  const content = buildMarkdownBody(structuredRecipe);
  return { title, content, structuredData: structuredRecipe };
}

/**
 * Converts structured recipe to full markdown format.
 * Returns complete markdown including title and body.
 * 
 * @param structuredRecipe - The structured recipe data from store
 * @returns Full markdown string, or empty string if no recipe available
 */
export function selectMarkdown(
  structuredRecipe: RecipeStructure | null
): string {
  if (!structuredRecipe) {
    return "";
  }
  
  return convertToMarkdown(structuredRecipe);
}
