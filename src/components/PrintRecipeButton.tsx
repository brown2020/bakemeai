"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/Button";
import { triggerRecipePrint } from "@/lib/utils/print-recipe";

interface PrintRecipeButtonProps {
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

/**
 * Opens the browser print dialog for the current recipe view.
 * Site chrome is excluded via global print styles targeting `.recipe-printable`.
 */
export function PrintRecipeButton({
  ariaLabel = "Print recipe",
}: PrintRecipeButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="no-print"
      onClick={triggerRecipePrint}
      aria-label={ariaLabel}
    >
      <Printer className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
      Print
    </Button>
  );
}
