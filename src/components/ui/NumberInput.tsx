"use client";

import { NUMBER_INPUT } from "@/lib/constants/ui";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * Number input component with label and min/max constraints.
 * Automatically falls back to min value on invalid input.
 */
export function NumberInput({
  label,
  value,
  onChange,
  min = NUMBER_INPUT.DEFAULT_MIN,
  max = NUMBER_INPUT.DEFAULT_MAX,
  className = "w-32",
}: NumberInputProps) {
  return (
    <div>
      <label className="block text-base sm:text-lg font-medium mb-3">
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        className={`${className} p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`}
      />
    </div>
  );
}





