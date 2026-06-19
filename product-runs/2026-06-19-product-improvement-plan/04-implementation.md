# Implementation

## Loop

- Name: Feature Build Loop
- Verify gate: Feature done-check passes, lint/build pass, no unapproved feature
  slipped in, no unrelated files changed.
- Stop condition: Each approved feature is committed and pushed, or blocked with
  evidence.
- Attempts: PIP-001 1/3
- Result: PIP-001 implemented

## Feature

- PIP-001 saved-library serving adjustment.

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

## Verification

- `npx vitest run src/lib/utils/saved-recipe.test.ts src/lib/utils/recipe-servings.test.ts`
  passed.
- `npm run lint` passed.
- `NEXT_PUBLIC_FIREBASE_API_KEY=placeholder NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=placeholder.firebaseapp.com NEXT_PUBLIC_FIREBASE_PROJECT_ID=placeholder NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=placeholder.appspot.com NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123 NEXT_PUBLIC_FIREBASE_APP_ID=placeholder OPENAI_API_KEY=placeholder npm run build`
  passed.

## Commit And Push

- Pending.
