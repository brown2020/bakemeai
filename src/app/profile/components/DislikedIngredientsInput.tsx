import React from "react";

interface DislikedIngredientsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const DislikedIngredientsInput: React.FC<DislikedIngredientsInputProps> = ({ value, onChange }) => (
  <div>
    <label className="block text-base sm:text-lg font-medium mb-3">
      Ingredients You Dislike
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
      placeholder="e.g., cilantro, olives (comma separated)"
      className="w-full p-2 border rounded-lg"
    />
  </div>
);

export default DislikedIngredientsInput;
