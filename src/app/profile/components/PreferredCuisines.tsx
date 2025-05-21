import React from "react";

interface PreferredCuisinesProps {
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}

const PreferredCuisines: React.FC<PreferredCuisinesProps> = ({ options, selected, onChange }) => (
  <div>
    <label className="block text-base sm:text-lg font-medium mb-3">
      Preferred Cuisines
    </label>
    <div className="flex flex-wrap gap-2">
      {options.map((cuisine) => (
        <button
          key={cuisine}
          type="button"
          onClick={() => onChange(cuisine)}
          className={`px-3 py-1.5 rounded-full text-sm ${
            selected.includes(cuisine)
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {cuisine}
        </button>
      ))}
    </div>
  </div>
);

export default PreferredCuisines;
