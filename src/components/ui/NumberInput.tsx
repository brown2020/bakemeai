"use client";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * A simple number input component with label.
 */
export function NumberInput({
  label,
  value,
  onChange,
  min = 1,
  max = 100,
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

