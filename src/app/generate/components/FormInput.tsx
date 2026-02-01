import { Input, Textarea } from "@/components/ui/Input";
import { FormInputProps } from "../types";
import { FORM_VALIDATION } from "@/lib/constants/ui";

interface CharCountDisplayProps {
  currentLength: number;
  maxLength: number;
  minLength: number;
  isApproachingLimit: boolean;
}

/**
 * Character count display with validation feedback.
 * Shows current/max count and minimum requirement warning when applicable.
 */
function CharCountDisplay({
  currentLength,
  maxLength,
  minLength,
  isApproachingLimit,
}: CharCountDisplayProps) {
  if (currentLength === 0) return null;

  const isValid = currentLength >= minLength && currentLength <= maxLength;

  return (
    <p
      className={`mt-1 text-sm ${
        isApproachingLimit ? "text-orange-600 font-medium" : "text-gray-500"
      }`}
    >
      {currentLength}/{maxLength} characters
      {!isValid && currentLength < minLength && (
        <span className="text-red-600 ml-2">(minimum {minLength} characters)</span>
      )}
    </p>
  );
}

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
  const isApproachingLimit =
    value.length > maxLength * FORM_VALIDATION.CHAR_LIMIT_WARNING_THRESHOLD;

  const charCountProps = {
    currentLength: value.length,
    maxLength,
    minLength,
    isApproachingLimit,
  };

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
        <CharCountDisplay {...charCountProps} />
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
      <CharCountDisplay {...charCountProps} />
    </div>
  );
}
