import { FormInputProps } from "../types";

export function FormInput({
  label,
  placeholder,
  value,
  onChange,
  isTextArea = false,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-base font-medium mb-2">{label}</label>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 border rounded-lg h-32"
          required
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 border rounded-lg"
          required
        />
      )}
    </div>
  );
}
