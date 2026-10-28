/**
 * Content sanitization utilities for preventing XSS and other security issues.
 * Provides defense-in-depth for user-generated and AI-generated content.
 */

/**
 * Sanitizes user input for safe storage and display.
 * More aggressive than markdown sanitization since user input
 * should be plain text without any HTML.
 * 
 * @param input - User input string
 * @returns Sanitized input safe for storage and display
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return "";

  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  return sanitized;
}

/**
 * Configuration for react-markdown to disallow dangerous elements.
 * Provides additional security layer in MarkdownRenderer.
 */
export const MARKDOWN_DISALLOWED_ELEMENTS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
];
