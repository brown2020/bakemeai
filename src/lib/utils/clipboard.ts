/**
 * Clipboard utilities for client components.
 */

/**
 * Writes text to the system clipboard.
 * @returns true when the copy succeeded, false when unavailable or denied.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard?.writeText
  ) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
