"use client";

import { useMemo } from "react";

interface ChipSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  variant?: "rounded" | "pill";
}

/**
 * Multi-select chip/pill component for selecting multiple options.
 * Supports toggle behavior and visual variants.
 */
export function ChipSelect({
  label,
  options,
  selected,
  onChange,
  variant = "pill",
}: ChipSelectProps) {
  const baseClasses = "px-3 py-1.5 text-sm transition-colors";
  const variantClasses = variant === "pill" ? "rounded-full" : "rounded-lg";
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <fieldset className="min-w-0 border-0 p-0 m-0">
      <legend className="block text-base sm:text-lg font-medium mb-3 px-0">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedSet.has(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={isSelected}
              className={`${baseClasses} ${variantClasses} ${
                isSelected
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
