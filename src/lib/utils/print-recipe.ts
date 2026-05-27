/**
 * Triggers the browser print dialog for the current page.
 * Printable recipe content must be wrapped in `.recipe-printable`.
 */
export function triggerRecipePrint(): void {
  if (typeof window === "undefined") return;
  window.print();
}
