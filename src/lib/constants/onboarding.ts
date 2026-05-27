/**
 * Profile onboarding constants.
 * Used to prompt new users to set cooking preferences before generating.
 */

/** localStorage key prefix; full key is `${PREFIX}${userId}`. */
export const ONBOARDING_DISMISSED_KEY_PREFIX = "bakemeai_onboarding_dismissed_" as const;

/** Query param on /profile indicating first-run welcome flow. */
export const PROFILE_WELCOME_QUERY = "welcome" as const;

export const PROFILE_WELCOME_VALUE = "1" as const;
