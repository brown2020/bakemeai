import { Input, Textarea } from "@/components/ui/Input";
import { FormInputProps } from "../types";
import { FORM_VALIDATION } from "@/lib/constants/ui";

/**
 * Form input component with character counting and validation feedback.
 * Adapts between single-line input and textarea based on context.
 */
export function FormInput({
  label,
  placeholder,
  value,
  onChange,
  isTextArea = false,
}: FormInputProps) {
  const minLength = isTextArea
    ? FORM_VALIDATION.TEXTAREA_MIN_LENGTH
    : FORM_VALIDATION.INPUT_MIN_LENGTH;
  const maxLength = isTextArea
    ? FORM_VALIDATION.TEXTAREA_MAX_LENGTH
    : FORM_VALIDATION.INPUT_MAX_LENGTH;
  const showCharCount = value.length > 0;
  const isValid = value.length >= minLength && value.length <= maxLength;
  const isApproachingLimit =
    value.length > maxLength * FORM_VALIDATION.CHAR_LIMIT_WARNING_THRESHOLD;

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
