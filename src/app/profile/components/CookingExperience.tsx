import React from "react";

interface CookingExperienceProps {
  levels: { value: "beginner" | "intermediate" | "advanced"; label: string }[];
  selected: "beginner" | "intermediate" | "advanced";
  onChange: (value: "beginner" | "intermediate" | "advanced") => void;
}

const CookingExperience: React.FC<CookingExperienceProps> = ({ levels, selected, onChange }) => (
  <div>
    <label className="block text-base sm:text-lg font-medium mb-3">
      Cooking Experience
    </label>
    <div className="flex flex-wrap gap-2">
      {levels.map((level) => (
        <button
          key={level.value}
          type="button"
          onClick={() => onChange(level.value)}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            selected === level.value
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {level.label}
        </button>
      ))}
    </div>
  </div>
);

export default CookingExperience;
