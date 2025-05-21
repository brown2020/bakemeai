import React from "react";

interface AllergiesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const AllergiesInput: React.FC<AllergiesInputProps> = ({ value, onChange }) => (
  <div>
    <label className="block text-base sm:text-lg font-medium mb-3">
      Allergies
    </label>
    <input
      type="text"
      value={value.join(", ")}
      onChange={(e) =>
        onChange(
          e.target.value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      }
      placeholder="e.g., peanuts, shellfish (comma separated)"
      className="w-full p-2 border rounded-lg"
    />
  </div>
);

export default AllergiesInput;
