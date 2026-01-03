"use client";

interface ChipSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  variant?: "rounded" | "pill";
}

/**
 * A multi-select chip/pill component for selecting multiple options.
 * Used for dietary preferences, cuisines, etc.
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

  return (
    <div>
      <label className="block text-base sm:text-lg font-medium mb-3">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`${baseClasses} ${variantClasses} ${
              selected.includes(option)
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}





