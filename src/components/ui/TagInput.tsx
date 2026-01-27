"use client";

import type { ReactElement } from "react";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

/**
 * A comma-separated tag input component.
 * Converts comma-separated text to/from string arrays.
 */
export function TagInput({
  label,
  value,
  onChange,
  placeholder = "Enter values separated by commas",
}: TagInputProps): ReactElement {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    onChange(newValue);
  };

  return (
    <div>
      <label className="block text-base sm:text-lg font-medium mb-3">
        {label}
      </label>
      <input
        type="text"
        value={value.join(", ")}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      />
    </div>
  );
}





