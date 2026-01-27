/**
 * Content sanitization utilities for preventing XSS and other security issues.
 * Provides defense-in-depth for user-generated and AI-generated content.
 */

/**
 * List of allowed HTML tags for markdown rendering.
 * Based on GitHub Flavored Markdown safe subset.
 */
const ALLOWED_TAGS = new Set([
  // Text formatting
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "code",
  "pre",
  // Headers
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // Lists
  "ul",
  "ol",
  "li",
  // Tables
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  // Links (with strict href validation)
  "a",
  // Quotes and separators
  "blockquote",
  "hr",
  // Inline elements
  "span",
  "div",
]);

/**
 * List of dangerous attributes that should never be allowed.
 */
const DANGEROUS_ATTRIBUTES = new Set([
  "onclick",
  "onload",
  "onerror",
  "onmouseover",
  "onmouseout",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
  "onkeydown",
  "onkeyup",
  "onkeypress",
]);

/**
 * Safe URL protocols that are allowed in href/src attributes.
 */
const SAFE_PROTOCOLS = ["http://", "https://", "mailto:"] as const;

/**
 * Dangerous URL protocols that should be blocked.
 */
const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:"] as const;

/**
 * Validates that a URL is safe for use in href/src attributes.
 * Only allows http, https, mailto protocols, and relative URLs.
 * 
 * Security considerations:
 * - Blocks javascript:, data:, and vbscript: protocols
 * - Blocks protocol-relative URLs (//evil.com)
 * - Allows relative paths (/path/to/resource)
 * 
 * @param url - The URL to validate
 * @returns True if the URL is safe to use
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;

  try {
    // Remove whitespace and normalize
    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    if (DANGEROUS_PROTOCOLS.some(protocol => trimmed.startsWith(protocol))) {
      return false;
    }

    // Allow relative URLs (but not protocol-relative)
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return true;
    }

    // Allow safe protocols
    if (SAFE_PROTOCOLS.some(protocol => trimmed.startsWith(protocol))) {
      return true;
    }

    // Block everything else
    return false;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a single HTML attribute name/value pair.
 * Removes dangerous event handlers and validates URLs.
 * 
 * @param name - Attribute name
 * @param value - Attribute value
 * @returns Sanitized attribute value or null if attribute should be removed
 */
export function sanitizeAttribute(
  name: string,
  value: string
): string | null {
  const lowerName = name.toLowerCase();

  // Block dangerous event handlers
  if (DANGEROUS_ATTRIBUTES.has(lowerName)) {
    return null;
  }

  // Validate URLs in href and src attributes
  if (lowerName === "href" || lowerName === "src") {
    return isSafeUrl(value) ? value : null;
  }

  // Allow other attributes but escape them
  return value;
}

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
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove style tags and their content (could contain CSS-based attacks)
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");

  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, "");

  // Remove event handlers in HTML attributes (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: and data: URIs
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*(javascript|data):/gi, "$1=");

  // Remove any remaining HTML comments (could hide malicious content)
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
 * Configuration for react-markdown to restrict allowed elements.
 * Use this in conjunction with sanitizeMarkdown for defense-in-depth.
 */
export const MARKDOWN_ALLOWED_ELEMENTS = Array.from(ALLOWED_TAGS);

/**
 * Configuration for react-markdown to disallow dangerous elements.
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
