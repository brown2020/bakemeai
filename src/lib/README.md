# Library Documentation

This directory contains core utilities, constants, and business logic for the application.

## Directory Structure

### `/store/`
Zustand state management stores:
- `auth-store.ts` - Authentication state
- `recipe-store.ts` - Recipe generation and management
- `user-profile-store.ts` - User preferences and profile

### `/utils/`
Utility functions organized by domain:
- `cookies.ts` - Cookie management for authentication
- `error-handler.ts` - Standardized error handling
- `firestore.ts` - Firestore data serialization
- `logger.ts` - Logging utilities
- `markdown.ts` - Markdown parsing (fallback for structured data)
- `navigation.ts` - Safe navigation and redirect utilities

### `/constants/`
Application constants:
- `ui.ts` - UI-related constants (validation, timing, etc.)

### Root Files
- `actions.ts` - Server actions for AI recipe generation
- `auth-constants.ts` - Authentication cookie names
- `auth-cookie.ts` - Client-side cookie operations
- `constants.ts` - Main constants (Firestore collections, options, etc.)
- `db.ts` - Firestore database operations
- `firebase.ts` - Firebase initialization
- `schemas.ts` - Zod schemas for runtime validation
- `types.ts` - TypeScript type definitions

## Best Practices

### Error Handling
Always use the standardized error handler:
```typescript
import { logAndConvertError, ERROR_MESSAGES } from "@/lib/utils/error-handler";

try {
  await operation();
} catch (error) {
  const message = logAndConvertError(
    error,
    "Log message for debugging",
    { contextKey: value },
    ERROR_MESSAGES.CATEGORY.ERROR_TYPE
  );
  throw new Error(message);
}
```

### Constants
Use named constants instead of magic numbers:
```typescript
import { FORM_VALIDATION, UI_TIMING } from "@/lib/constants/ui";

const maxLength = FORM_VALIDATION.INPUT_MAX_LENGTH;
setTimeout(callback, UI_TIMING.SUCCESS_MESSAGE_DURATION);
```

### Type Safety
- All functions have explicit return types
- Use Zod schemas for runtime validation
- Avoid type assertions - validate instead
