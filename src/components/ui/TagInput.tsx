"use client";

import { useId, useState } from "react";

import { FORM_VALIDATION, RECIPE } from "@/lib/constants/ui";
import {
  commitTagDraft,
  sameTags,
  splitTrailingTagDraft,
} from "@/lib/utils/tags";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxLength?: number;
  maxItemLength?: number;
  maxItems?: number;
}

/**
 * Comma-separated tag input.
 * `value` is the committed list and stays visible as chips. Keystrokes stay in
 * local draft state until a comma, Enter, or blur, so typing cannot replace
 * tags that were already saved.
 */
export function TagInput({
  label,
  value,
  onChange,
  placeholder = "Enter values separated by commas",
  maxLength = FORM_VALIDATION.TEXTAREA_MAX_LENGTH,
  maxItemLength = RECIPE.MAX_TITLE_LENGTH,
  maxItems = 50,
}: TagInputProps) {
  const id = useId();
  const [draft, setDraft] = useState("");

  const commit = (nextDraft: string, clearDraft: boolean) => {
    const next = commitTagDraft(value, nextDraft, maxItemLength, maxItems);
    if (!sameTags(value, next)) onChange(next);
    if (clearDraft) setDraft("");
  };

  const handleChange = (input: string) => {
    if (input.length > maxLength) return;

    if (input.includes(",")) {
      const { committed, remainder } = splitTrailingTagDraft(input);
      setDraft(remainder);
      commit(committed, false);
      return;
    }

    setDraft(input);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-base sm:text-lg font-medium mb-3">
        {label}
      </label>
      {value.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
            >
              <span>{tag}</span>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-900"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(value.filter((item) => item !== tag))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={() => commit(draft, true)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          commit(draft, true);
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      />
    </div>
  );
}
