import { Input, Textarea } from "@/components/ui";
import { FormInputProps } from "../types";

export function FormInput({
  label,
  placeholder,
  value,
  onChange,
  isTextArea = false,
}: FormInputProps) {
  const minLength = isTextArea ? 3 : 3;
  const maxLength = isTextArea ? 1000 : 500;
  const showCharCount = value.length > 0;
  const isValid = value.length >= minLength && value.length <= maxLength;
  const isApproachingLimit = value.length > maxLength * 0.8;

  if (isTextArea) {
    return (
      <div>
        <Textarea
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-32"
          required
          minLength={minLength}
          maxLength={maxLength}
        />
        {showCharCount && (
          <p
            className={`mt-1 text-sm ${
              isApproachingLimit
                ? "text-orange-600 font-medium"
                : "text-gray-500"
            }`}
          >
            {value.length}/{maxLength} characters
            {!isValid && value.length < minLength && (
              <span className="text-red-600 ml-2">
                (minimum {minLength} characters)
              </span>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <Input
        label={label}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        minLength={minLength}
        maxLength={maxLength}
      />
      {showCharCount && (
        <p
          className={`mt-1 text-sm ${
            isApproachingLimit ? "text-orange-600 font-medium" : "text-gray-500"
          }`}
        >
          {value.length}/{maxLength} characters
          {!isValid && value.length < minLength && (
            <span className="text-red-600 ml-2">
              (minimum {minLength} characters)
            </span>
          )}
        </p>
      )}
    </div>
  );
}
