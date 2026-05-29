"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/Button";
import { copyTextToClipboard } from "@/lib/utils/clipboard";
import { UI_TIMING } from "@/lib/constants/ui";

interface CopyRecipeButtonProps {
  /** Lazily builds the text to copy (so scaled/streamed values are current at click time). */
  getText: () => string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
}

type CopyState = "idle" | "copied" | "error";

/**
 * Copies the current recipe to the clipboard as markdown with inline feedback.
 * Feedback resets automatically after `UI_TIMING.SUCCESS_MESSAGE_DURATION`.
 */
export function CopyRecipeButton({
  getText,
  ariaLabel = "Copy recipe to clipboard",
}: CopyRecipeButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const succeeded = await copyTextToClipboard(getText());
    setState(succeeded ? "copied" : "error");

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(
      () => setState("idle"),
      UI_TIMING.SUCCESS_MESSAGE_DURATION
    );
  }, [getText]);

  const label =
    state === "copied" ? "Copied!" : state === "error" ? "Copy failed" : "Copy";

  return (
    <Button
      type="button"
      variant="secondary"
      className="no-print"
      onClick={handleCopy}
      aria-label={ariaLabel}
    >
      {state === "copied" ? (
        <Check className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
      ) : (
        <Copy className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span aria-live="polite">{label}</span>
    </Button>
  );
}
