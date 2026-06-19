# Implementation

## Loop

- Name: Feature Build Loop
- Verify gate: Feature done-check passes, lint/build pass, no unapproved feature
  slipped in, no unrelated files changed.
- Stop condition: Each approved feature is committed and pushed, or blocked with
  evidence.
- Attempts: PIP-001 1/3; PIP-002 1/3; PIP-003 1/3
- Result: PIP-001, PIP-002, and PIP-003 implemented

## Feature

- PIP-001 saved-library serving adjustment.
- PIP-002 session generation history.
- PIP-003 server-side generation rate limit.

## Changes Made

- Added `getCompleteStructureFromSavedRecipe` to safely use modern saved recipe
  structured fields for saved-library scaling.
- Added `useSavedRecipeServingScale` to keep saved detail scaling display-only,
  build scaled copy/print content, and save an explicit scaled copy through the
  existing recipe service.
- Updated saved recipe detail with a servings control and "Save scaled copy"
  action.
- Exposed `refreshRecipes` from `useSavedRecipes` so the library can reload
  after saving a scaled copy.
- Added session-only generation history to `recipe-store`, outside the persisted
  `partialize` slice.
- Added `addRecipeToGenerationHistory` utility to cap history at five snapshots
  and dedupe repeated results.
- Captured complete streamed recipes into history after generation completes.
- Added a `/generate` recent generations panel with restore and clear actions.
- Added a dependency-light in-memory fixed-window rate limiter utility.
- Gated authenticated recipe generation at 8 requests per 60 seconds before
  starting an OpenAI stream.
- Documented the server-side rate limit in `AGENTS.md`.

## Verification

- `npx vitest run src/lib/utils/saved-recipe.test.ts src/lib/utils/recipe-servings.test.ts`
  passed.
- `npm run lint` passed.
- `NEXT_PUBLIC_FIREBASE_API_KEY=placeholder NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=placeholder.firebaseapp.com NEXT_PUBLIC_FIREBASE_PROJECT_ID=placeholder NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=placeholder.appspot.com NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123 NEXT_PUBLIC_FIREBASE_APP_ID=placeholder OPENAI_API_KEY=placeholder npm run build`
  passed.
- `npx vitest run src/lib/utils/recipe-history.test.ts src/lib/utils/recipe-prompt.test.ts`
  passed.
- `npm run lint` passed.
- `NEXT_PUBLIC_FIREBASE_API_KEY=placeholder NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=placeholder.firebaseapp.com NEXT_PUBLIC_FIREBASE_PROJECT_ID=placeholder NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=placeholder.appspot.com NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123 NEXT_PUBLIC_FIREBASE_APP_ID=placeholder OPENAI_API_KEY=placeholder npm run build`
  passed after PIP-002.
- `npx vitest run src/lib/utils/rate-limit.test.ts src/lib/utils/error-handler.test.ts`
  passed.
- `npm run lint` passed.
- `NEXT_PUBLIC_FIREBASE_API_KEY=placeholder NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=placeholder.firebaseapp.com NEXT_PUBLIC_FIREBASE_PROJECT_ID=placeholder NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=placeholder.appspot.com NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123 NEXT_PUBLIC_FIREBASE_APP_ID=placeholder OPENAI_API_KEY=placeholder npm run build`
  passed after PIP-003.

## Commit And Push

- Pending.
