import { Input, Textarea } from "@/components/ui";
import { FormInputProps } from "../types";

export function FormInput({
  label,
  placeholder,
  value,
  onChange,
  isTextArea = false,
}: FormInputProps) {
  if (isTextArea) {
    return (
      <Textarea
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-32"
        required
      />
    );
  }

  return (
    <Input
      label={label}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
    />
  );
}
