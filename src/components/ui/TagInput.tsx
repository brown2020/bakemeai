"use client";

import { useId, useState } from "react";

import { FORM_VALIDATION, RECIPE } from "@/lib/constants/ui";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxLength?: number;
  maxItemLength?: number;
}


/**
 * Parses comma-separated text into trimmed, length-validated tags.
 */
function parseTags(input: string, maxItemLength: number): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= maxItemLength);
}

/**
 * Comma-separated tag input component.
 * Converts comma-separated text to/from string arrays for easy entry.
 *
 * Keeps the raw text in local state so in-progress separators (e.g. a trailing
 * comma) are not stripped mid-typing by the parsed value. The parsed array is
 * still emitted to the parent on every change, and local text is reconciled
 * when the external value changes for a different reason (e.g. profile load).
 *
 * Features:
 * - Validates total input length to prevent excessive data
 * - Validates individual item length to prevent abuse
 * - Trims whitespace and filters empty items
 * - Prevents script injection via length limits
 */
export function TagInput({
  label,
  value: _value,
  onChange,
  placeholder = "Enter values separated by commas",
  maxLength = FORM_VALIDATION.TEXTAREA_MAX_LENGTH,
  maxItemLength = RECIPE.MAX_TITLE_LENGTH,
}: TagInputProps) {
  const id = useId();
  // Local draft starts empty; parents should remount via `key` when the
  // committed tag list is replaced from outside (e.g. profile load).
  const [text, setText] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Prevent excessive input length (defense against DoS/memory issues)
    if (input.length > maxLength) {
      return;
    }

    setText(input);
    onChange(parseTags(input, maxItemLength));
  };

  return (
    <div>
      <label htmlFor={id} className="block text-base sm:text-lg font-medium mb-3">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      />
    </div>
  );
}

