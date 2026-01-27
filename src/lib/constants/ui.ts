/**
 * UI-related constants for consistent behavior across the application.
 */

export const FORM_VALIDATION = {
  INPUT_MIN_LENGTH: 3,
  INPUT_MAX_LENGTH: 500,
  TEXTAREA_MIN_LENGTH: 3,
  TEXTAREA_MAX_LENGTH: 1000,
  CHAR_LIMIT_WARNING_THRESHOLD: 0.8,
} as const;

/** All durations in milliseconds */
export const UI_TIMING = {
  SUCCESS_MESSAGE_DURATION: 3000,
  SEARCH_DEBOUNCE: 300,
  DEFAULT_TRANSITION: 200,
  LONG_TRANSITION: 500,
} as const;

export const NUMBER_INPUT = {
  DEFAULT_MIN: 1,
  DEFAULT_MAX: 100,
  SERVING_SIZE_MIN: 1,
  SERVING_SIZE_MAX: 12,
  SERVING_SIZE_DEFAULT: 2,
} as const;

/** Spacing values in Tailwind units, height in pixels */
export const LAYOUT = {
  MAX_CONTAINER_WIDTH: "7xl",
  SECTION_SPACING: 8,
  CARD_PADDING: 6,
  NAVBAR_HEIGHT: 64,
} as const;

export const RECIPE = {
  PREVIEW_INGREDIENTS_COUNT: 3,
  DEFAULT_TITLE: "New Recipe",
  MAX_TITLE_LENGTH: 100,
  MAX_SERVINGS: 100,
} as const;
