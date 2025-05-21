import React from "react";

interface DietaryOptionsProps {
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}

const DietaryOptions: React.FC<DietaryOptionsProps> = ({ options, selected, onChange }) => (
  <div>
    <label className="block text-base sm:text-lg font-medium mb-3">
      Dietary Preferences
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-3 py-1.5 rounded-full text-sm ${
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

export default DietaryOptions;
