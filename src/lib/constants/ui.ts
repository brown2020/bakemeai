/**
 * UI-related constants for consistent behavior across the application.
 */

/**
 * Form validation constants
 */
export const FORM_VALIDATION = {
  /** Minimum length for text inputs */
  INPUT_MIN_LENGTH: 3,
  /** Maximum length for regular text inputs */
  INPUT_MAX_LENGTH: 500,
  /** Minimum length for textarea inputs */
  TEXTAREA_MIN_LENGTH: 3,
  /** Maximum length for textarea inputs */
  TEXTAREA_MAX_LENGTH: 1000,
  /** Threshold (as percentage) when to show "approaching limit" warning */
  CHAR_LIMIT_WARNING_THRESHOLD: 0.8,
} as const;

/**
 * UI timing constants (in milliseconds)
 */
export const UI_TIMING = {
  /** Duration to show success messages before auto-hiding */
  SUCCESS_MESSAGE_DURATION: 3000,
  /** Debounce delay for search inputs */
  SEARCH_DEBOUNCE: 300,
} as const;

/**
 * Number input constraints
 */
export const NUMBER_INPUT = {
  /** Default minimum value for number inputs */
  DEFAULT_MIN: 1,
  /** Default maximum value for number inputs */
  DEFAULT_MAX: 100,
  /** Minimum serving size */
  SERVING_SIZE_MIN: 1,
  /** Maximum serving size */
  SERVING_SIZE_MAX: 12,
  /** Default serving size */
  SERVING_SIZE_DEFAULT: 2,
} as const;
