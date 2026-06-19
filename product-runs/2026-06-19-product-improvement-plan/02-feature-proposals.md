# Feature Proposals

## Recommended First Pick

- `PIP-001` Saved-library serving adjustment.

This completes a visible half-shipped workflow with existing utility coverage,
keeps the product focused on cooking from saved recipes, and avoids new
infrastructure.

## Candidates

| ID | Title | User Value | Evidence | Score | Effort | Risk | Done-Check |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PIP-001 | Saved-library serving adjustment | Lets a user resize a saved recipe for tonight's headcount without regenerating or paying for AI again. | `spec.md` Milestone 1; `/generate` has `NumberInput` + `useRecipeServingScale`; `RecipeDetail` only renders content/copy/print. | 29/30 | M | Low | Saved detail has a 1-12 servings control, updates displayed ingredients/calories via existing scaling util, leaves the original document unchanged, and can save a scaled copy explicitly. |
| PIP-002 | Session generation history | Lets users compare several generated variations and save the best one instead of losing each prior result on regenerate. | `spec.md` Milestone 2; `useRecipeGeneration` clears `structuredRecipe` for each run; `recipe-store` intentionally persists only inputs. | 26/30 | M | Medium | Up to 5 recent generated snapshots appear on `/generate`, selecting one restores display/save state, "Clear history" works, and history clears on sign-out without localStorage persistence. |
| PIP-003 | Server-side generation rate limit | Protects OpenAI budget and service availability from runaway authenticated generation. | `spec.md` Milestone 3; `generateRecipe` checks auth before OpenAI but has no volume cap; client debounce is only 500ms. | 25/30 | M | Medium | A signed-in user over the configured window receives `ERROR_MESSAGES.RECIPE.RATE_LIMIT`, no OpenAI stream starts, normal usage still works, and the limit is documented. |
| PIP-004 | Refine from saved recipe | Lets users reopen a saved recipe as a starting point for a new generation/refinement session. | `spec.md` marks "Regenerate from saved" as not shipped; saved `RecipeDetail` has no regenerate/refine action while `/generate` already supports tweak/regenerate. | 23/30 | M | Medium | Saved detail offers a refine action that routes to `/generate` with a sensible prompt/mode, the user can edit before generating, and the original saved recipe is unchanged. |
| PIP-005 | Saved-library metadata filters | Makes larger libraries easier to browse by difficulty, cuisine, or time instead of title/ingredient text only. | Saved schema stores metadata; `filterRecipesBySearch` searches only title and ingredients; `RecipeSearch` is a plain text input. | 23/30 | S-M | Low-Medium | Saved library can filter by at least difficulty and cuisine when metadata exists, preserves text search, and `recipe-library` tests cover combined filtering. |

## Rubric Scores

Scores are User Value / Product Fit / Evidence / Leanness / Testability / Low
Risk, each out of 5.

| ID | Scores |
| --- | --- |
| PIP-001 | 5 / 5 / 5 / 5 / 5 / 4 |
| PIP-002 | 5 / 5 / 5 / 4 / 4 / 3 |
| PIP-003 | 4 / 5 / 5 / 4 / 4 / 3 |
| PIP-004 | 4 / 4 / 5 / 4 / 3 / 3 |
| PIP-005 | 4 / 4 / 4 / 4 / 4 / 3 |

## Likely Owned Files

| ID | Owned Files |
| --- | --- |
| PIP-001 | `src/app/saved/page.tsx`, `src/app/saved/components/RecipeDetail.tsx`, possibly a focused saved-scaling hook or utility, `src/lib/services/recipe-service.ts`, `src/lib/utils/recipe-servings.test.ts` or a new pure utility test. |
| PIP-002 | `src/lib/store/recipe-store.ts`, `src/hooks/useRecipeGeneration.ts`, `src/app/generate/page.tsx`, a small route component for history, `src/components/AuthListener.tsx`, store/selector tests if added. |
| PIP-003 | `src/lib/recipe-generation.server.ts`, a new pure rate-limit utility under `src/lib/utils/`, `src/lib/utils/error-handler.ts` if needed, `AGENTS.md`, unit tests for the limiter. |
| PIP-004 | `src/app/saved/page.tsx`, `src/app/saved/components/RecipeDetail.tsx`, `src/lib/store/recipe-store.ts`, `src/app/generate/page.tsx`, prompt utility tests if a prompt builder is added. |
| PIP-005 | `src/lib/utils/recipe-library.ts`, `src/lib/utils/recipe-library.test.ts`, `src/app/saved/page.tsx`, `src/app/saved/components/RecipeSearch.tsx` or a new filter component. |

## Do Not Build Now

- Public recipe sharing/community. Useful later, but it changes privacy and data
  access boundaries.
- Meal-planning calendar. It is a larger product surface than the current
  generate/save/library loop.
- Shopping-list generation. It could be useful, but should follow stronger
  saved-recipe utility first.
- Firebase Storage uploads. Storage is initialized but there is no product job
  yet that needs files.
- Native mobile app, voice-guided cooking, smart-appliance integration, or broad
  dashboards.
- CI setup as the main product improvement. Valuable engineering work, but this
  run should prioritize user-facing product value.

## Approval Request

I found these candidate product improvements: PIP-001, PIP-002, PIP-003,
PIP-004, PIP-005.

Which feature IDs should I add to the roadmap and implement?
