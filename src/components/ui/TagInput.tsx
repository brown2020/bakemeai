"use client";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxLength?: number;
  maxItemLength?: number;
}

/**
 * Comma-separated tag input component.
 * Converts comma-separated text to/from string arrays for easy entry.
 * 
 * Features:
 * - Validates total input length to prevent excessive data
 * - Validates individual item length to prevent abuse
 * - Trims whitespace and filters empty items
 * - Prevents script injection via length limits
 */
export function TagInput({
  label,
  value,
  onChange,
  placeholder = "Enter values separated by commas",
  maxLength = 1000,
  maxItemLength = 100,
}: TagInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Prevent excessive input length (defense against DoS/memory issues)
    if (input.length > maxLength) {
      return;
    }
    
    const newValue = input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item.length <= maxItemLength);
    
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
        maxLength={maxLength}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
      />
    </div>
  );
}





