import React from "react";

interface ServingSizeInputProps {
  value: number;
  onChange: (value: number) => void;
}

const ServingSizeInput: React.FC<ServingSizeInputProps> = ({ value, onChange }) => (
  <div>
    <label className="block text-base sm:text-lg font-medium mb-3">
      Default Serving Size
    </label>
    <input
      type="number"
      min="1"
      max="12"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-32 p-2 border rounded-lg"
    />
  </div>
);

export default ServingSizeInput;
