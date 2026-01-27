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
  /** Default animation/transition duration */
  DEFAULT_TRANSITION: 200,
  /** Long animation/transition duration */
  LONG_TRANSITION: 500,
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

/**
 * Layout and spacing constants (in pixels or Tailwind units)
 */
export const LAYOUT = {
  /** Maximum container width */
  MAX_CONTAINER_WIDTH: "7xl",
  /** Standard vertical spacing between sections */
  SECTION_SPACING: 8,
  /** Standard padding for cards */
  CARD_PADDING: 6,
  /** Navigation bar height (in px) */
  NAVBAR_HEIGHT: 64,
} as const;

/**
 * Z-index layers for consistent stacking context
 */
export const Z_INDEX = {
  /** Base layer for normal content */
  BASE: 0,
  /** Dropdown menus and tooltips */
  DROPDOWN: 10,
  /** Sticky headers */
  STICKY: 20,
  /** Fixed navigation bars */
  NAVBAR: 50,
  /** Modal overlays */
  MODAL: 100,
  /** Toast notifications */
  TOAST: 1000,
} as const;

/**
 * Recipe display constants
 */
export const RECIPE = {
  /** Maximum number of ingredients to show in recipe card preview */
  PREVIEW_INGREDIENTS_COUNT: 3,
  /** Default recipe title when none can be extracted */
  DEFAULT_TITLE: "New Recipe",
  /** Maximum title length for validation */
  MAX_TITLE_LENGTH: 100,
  /** Maximum servings value */
  MAX_SERVINGS: 100,
} as const;
