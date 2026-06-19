# Product Context

## Sources Read

- `AGENTS.md`
- `spec.md`
- `README.md`
- `src/app/README.md`
- `src/lib/README.md`
- `package.json`
- Route surfaces under `src/app/`
- Generation flow: `src/app/generate/page.tsx`,
  `src/app/generate/components/RecipeDisplay.tsx`,
  `src/hooks/useRecipeGeneration.ts`,
  `src/hooks/useRecipeServingScale.ts`,
  `src/lib/store/recipe-store.ts`
- Saved library flow: `src/app/saved/page.tsx`,
  `src/app/saved/components/RecipeDetail.tsx`,
  `src/hooks/useSavedRecipes.ts`,
  `src/lib/utils/recipe-library.ts`
- Persistence and AI boundaries: `src/lib/db/recipes.ts`,
  `src/lib/services/recipe-service.ts`,
  `src/lib/recipe-generation.server.ts`,
  `src/lib/utils/server-auth.ts`
- Profile/personalization flow: `src/app/profile/page.tsx`,
  `src/hooks/useProfileForm.ts`, `src/hooks/useUserProfile.ts`,
  `src/lib/prompts.ts`
- Validation/security files: `firestore.rules`, `storage.rules`,
  `src/lib/schemas/recipe.ts`, `src/lib/utils/error-handler.ts`,
  `src/components/AuthListener.tsx`
- Current unit-test surfaces under `src/lib/**/*.test.ts` and
  `src/proxy.test.ts`

## Current Product

Bake.me is a signed-in AI recipe web app for home cooks. Users can set dietary
preferences, allergies, disliked ingredients, preferred cuisines, experience
level, and default serving size; generate structured recipes from either a dish
request or available ingredients; refine/regenerate the active result; save a
complete recipe to Firestore; and browse, search, print, copy, or delete saved
recipes.

The product is a Next.js 16 App Router application using React 19, Tailwind CSS
v4, Zustand, Firebase Auth/Firestore, Zod, and Vercel AI SDK server actions.
The single AI entry point is `generateRecipe`, which verifies a Firebase auth
cookie before starting an OpenAI stream.

## Users And Workflows

- Home cooks looking for a recipe based on a craving or pantry ingredients.
- Users with dietary restrictions, allergies, disliked ingredients, or cuisine
  preferences who need the generated recipe to respect their profile.
- Returning users who want a private saved recipe library.

Core workflow:

1. Sign up or sign in.
2. Optionally complete cooking preferences.
3. Choose recipe generation mode.
4. Stream a structured recipe.
5. Optionally scale, tweak, regenerate, save, print, or copy the result.
6. Return to the saved library to search, view, copy, print, or delete recipes.

## Current Features

- Public landing and static support/legal/about pages.
- Email/password and Google authentication.
- Profile editor with dietary chips, tag inputs, experience, cuisines, and
  serving size.
- New-user profile onboarding banner.
- Auth-gated AI recipe generation with streaming structured output.
- Client-side debounce and stale-stream cancellation for generation.
- Regenerate/refine on the active generated recipe.
- Display-only serving scaling on `/generate`.
- Nutrition summary rendering and persistence for new saved recipes, with legacy
  markdown parsing on read.
- Firestore-backed saved library with search by title/ingredient, detail panel,
  optimistic delete rollback, print, and copy.
- Route-protection proxy plus Firestore default-deny ownership rules.

## Gaps And Friction

- Saved recipe detail does not expose serving-size adjustment even though saved
  recipes store structured ingredients, instructions, servings, calories, and
  macros. This leaves serving scaling half-shipped across the product.
- Regenerating replaces the active recipe; there is no short session history for
  comparing several generations before saving.
- Authenticated generation is not server-rate-limited. The server action gates
  on auth before OpenAI but does not cap per-user volume.
- Saved recipes cannot be sent back into the generation/refinement flow from the
  library.
- Saved-library search is text-only over title and ingredients, despite saved
  recipes carrying structured metadata such as difficulty, cuisine, and times.

## Constraints And Non-Goals

- Work must stay on `dev` and avoid direct `main` pushes.
- Do not add REST API routes; current AI surface is a server action.
- Do not fetch Firestore directly in components; use hooks/services/db layers.
- Do not persist AI output in localStorage; recipe-store persistence is limited
  to user inputs.
- Avoid new paid services or credentials.
- Avoid large product pivots such as public recipe communities, meal planning,
  or shopping-list platforms unless separately approved.
