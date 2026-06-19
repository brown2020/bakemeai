# Spec And Roadmap Scout

## Loop

- Name: Product Discovery Loop
- Verify gate: Product claims are evidence-backed; missing docs are created only
  as current-state docs; candidates are not committed as approved roadmap items.
- Stop condition: Product map and current gaps are clear enough to propose
  features.
- Attempts: 1/2
- Result: PASS

## Existing Docs

- `spec.md` exists and is the authoritative product specification plus roadmap.
  It lists shipped features, current limitations, and three prioritized
  milestones.
- `AGENTS.md` exists and documents architecture, workflow boundaries, validation,
  Git policy, and cautious files.
- `README.md` exists for setup and high-level product context.
- `src/app/README.md` and `src/lib/README.md` document local conventions.
- No standalone `product-roadmap.md`, `roadmap.md`, or `ROADMAP.md` file exists.
  The roadmap currently lives inside `spec.md`, so no duplicate roadmap file was
  created.

## Docs Created Or Updated

- Created this run folder via the workflow script:
  `product-runs/2026-06-19-product-improvement-plan/`.
- Updated run discovery/proposal docs only.
- No changes were made to `spec.md` because it already contains current-state
  product context and a roadmap section.
- No approved roadmap changes were made.

## Evidence

- `spec.md` identifies saved-library serving scaling as partial, session
  generation history and server-side rate limiting as roadmap milestones, and
  public sharing, meal planning, shopping list, and mobile app as unshipped or
  deferred.
- `src/app/generate/components/RecipeDisplay.tsx` uses `NumberInput`,
  `targetServings`, `onApplyServingScale`, and `RecipeExportActions` for the
  generated recipe.
- `src/hooks/useRecipeServingScale.ts` wraps `scaleRecipeServings` for generated
  recipes and resets save state after scaling.
- `src/lib/utils/recipe-servings.ts` has deterministic scaling utilities with
  colocated tests in `src/lib/utils/recipe-servings.test.ts`.
- `src/app/saved/components/RecipeDetail.tsx` renders saved recipe content plus
  copy/print actions, but no serving control or save-scaled-copy action.
- `src/hooks/useRecipeGeneration.ts` clears `structuredRecipe` before each new
  generation and only keeps one active result.
- `src/lib/store/recipe-store.ts` persists only `input`, `ingredients`, and
  `mode`, which supports a session-only history feature if implemented without
  adding AI output to the persisted slice.
- `src/lib/recipe-generation.server.ts` calls `requireAuthenticatedUserId()`
  before validating prompt/config and starting `streamObject`.
- `src/lib/utils/server-auth.ts` verifies the Firebase token but does not enforce
  a request cap.
- `src/hooks/useSavedRecipes.ts` filters via `filterRecipesBySearch`, and
  `src/lib/utils/recipe-library.ts` searches only title and ingredients.
- `src/lib/schemas/recipe.ts` includes structured saved metadata: ingredients,
  instructions, tips, preparation/cooking time, servings, cuisine, difficulty,
  calories, and macros.

## Verification

- Git preflight passed on `dev`: remote read worked, `git pull --ff-only origin
  dev` was already up to date, and `git push --dry-run origin dev` returned
  "Everything up-to-date".
- Discovery read the primary product docs, route files, hooks, service/db
  boundaries, schemas, security rules, and relevant utility tests.
- Candidate features remain in `02-feature-proposals.md` and `task-queue.md`
  with `Proposed` status only.
