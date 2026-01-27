/**
 * Content sanitization utilities for preventing XSS and other security issues.
 * Provides defense-in-depth for user-generated and AI-generated content.
 */

/**
 * Sanitizes markdown content before rendering.
 * Provides additional layer of security beyond react-markdown's built-in sanitization.
 * 
 * Strategy:
 * - Remove potentially dangerous HTML/script tags
 * - Validate URLs to prevent javascript: and data: URIs
 * - Escape special characters that could be used for XSS
 * 
 * Note: This is a defense-in-depth measure. The react-markdown library
 * provides its own sanitization, but this adds an extra layer of protection.
 * 
 * @param content - Raw markdown content to sanitize
 * @returns Sanitized markdown content safe for rendering
 */
export function sanitizeMarkdown(content: string): string {
  if (!content) return "";

  let sanitized = content;

  // Remove script tags and their content
  // Prevents XSS attacks via <script>alert('xss')</script>
  // Pattern: Matches opening tag, any content, and closing tag
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove style tags and their content
  // Prevents CSS-based attacks (e.g., expression() in IE, @import with malicious CSS)
  // Pattern: Matches opening tag, any content, and closing tag
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove iframe tags
  // Prevents embedding external malicious content or clickjacking
  // Pattern: Matches opening tag, any content, and closing tag
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");

  // Remove object and embed tags
  // Prevents loading Flash objects or other embedded plugins that could execute code
  // Pattern: Uses backreference \1 to match the same tag name for opening and closing
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, "");

  // Remove event handlers in HTML attributes
  // Prevents XSS via onclick="malicious()", onerror="xss()", etc.
  // Pattern: Matches "on" + any word chars + "=" + quoted value
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: and data: URIs
  // Prevents XSS via <a href="javascript:alert('xss')"> and data URIs
  // Pattern: Matches href/src attributes starting with javascript: or data:
  // Replacement: Keeps the attribute name but removes the dangerous protocol
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*(javascript|data):/gi, "$1=");

  // Remove HTML comments
  // Prevents hiding malicious content in comments that might be processed by IE
  // Pattern: Matches <!-- any content --> including multiline
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, "");

  return sanitized;
}

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
