# Bake.me — Product Specification & Roadmap

**Authoritative product document.** Architecture and agent conventions live in [`AGENTS.md`](AGENTS.md). End-user setup remains in [`README.md`](README.md).

**Last reviewed**: 2026-06-06 (from full codebase inspection on `dev` branch)

---

## 1. Product Overview

### Product promise

Bake.me is a personal AI chef: describe what you want to cook or list what you have, and get a structured, personalized recipe you can cook from — then save it to your private library.

### Target users

- Home cooks who want inspiration from pantry ingredients.
- People with dietary restrictions, allergies, or disliked ingredients who need recipes that respect those constraints.
- Users who want a simple, signed-in experience (not anonymous generation) with a persistent recipe collection.

### Core workflows

```mermaid
flowchart LR
  A[Sign up / Sign in] --> B[Set cooking preferences]
  B --> C[Choose generation mode]
  C --> D[Enter dish or ingredients]
  D --> E[Stream AI recipe]
  E --> F{Save?}
  F -->|Yes| G[Saved library]
  F -->|No| C
  G --> H[Search / view / delete]
```

1. **Acquire** — Landing page → sign up (email or Google) or sign in.
2. **Personalize** — Profile: dietary, allergies, dislikes, cuisines, experience, serving size.
3. **Generate** — Pick mode (specific dish vs. ingredients) → submit → watch recipe stream in.
4. **Retain** — Save complete recipe to Firestore; browse/search/delete in Saved Recipes.
5. **Return** — Sign in again; inputs may persist locally; saved recipes load from Firestore.

### Product goals

- **Relevance** — Recipes reflect stated preferences and mode (pantry vs. craving).
- **Trust** — Clear auth, owned data, sanitized rendering, predictable save behavior.
- **Speed** — Streaming generation so users see progress immediately.
- **Simplicity** — Minimal surface area: generate, profile, saved library; no social or meal-planning scope yet.

---

## 2. Current Application State

### What the app does today

Bake.me is a Next.js 16 web application with Firebase Auth + Firestore and OpenAI-powered structured recipe generation via Vercel AI SDK server actions. There are no REST API routes, no mobile app, and no background workers.

### Feature inventory

| Feature | Status | Notes |
|---------|--------|-------|
| Landing + marketing pages | Shipped | `/`, `/about`, `/privacy`, `/terms`, `/support` |
| Email/password auth | Shipped | Remember-me, verification email on signup |
| Google auth | Shipped | Popup flow |
| Password reset | Shipped | `/reset-password` |
| Cooking preferences profile | Shipped | `/profile` — chips, tags, serving size |
| Post-signup profile onboarding | Shipped | Banner on `/generate`; welcome flow at `/profile?welcome=1` |
| Recipe generation (specific dish) | Shipped | Zod-validated input, streaming UI |
| Recipe generation (ingredients) | Shipped | Same pipeline, different prompt |
| Regenerate with optional tweak | Shipped | On `/generate` after first result |
| Serving size adjustment | Shipped | Deterministic scale on `/generate` (1–12 servings) |
| AI personalization | Shipped | Profile injected into system prompt |
| Difficulty + times + servings | Shipped | In schema, markdown, and saved docs |
| Tips | Shipped | Optional in generation output |
| Nutrition (calories / macros) | Shipped | `NutritionSummaryPanel` on generate + saved detail; persisted top-level on new saves |
| Authenticated generation | Shipped | `requireAuthenticatedUserId()` gates the server action before OpenAI |
| Save recipe | Shipped | Requires complete structured fields |
| Saved library | Shipped | Search, detail, delete with optimistic UI |
| Route protection (UX) | Shipped | `proxy.ts` cookie/JWT expiry check |
| Firestore security | Shipped | Default-deny; per-user ownership |
| Firebase Storage | Not used | SDK + rules exist; no UI |
| Copy recipe to clipboard | Shipped | `CopyRecipeButton` (markdown incl. macros) on generate + saved detail |
| Recipe sharing (public link) | Not shipped | Clipboard copy only; no public URLs |
| Print / export | Shipped | Print button on generate + saved detail; `@media print` layout |
| Regenerate from saved | Not shipped | Regenerate on `/generate` only |
| Serving scaling | Partial | Adjust on `/generate` only; not in saved library |
| Shopping list | Not shipped | README aspirational only |
| Meal planning | Not shipped | README aspirational only |
| Automated tests | Partial | 13 Vitest suites (61 tests) over pure utils + the proxy matcher invariant: `jwt`, `route-match`, `navigation`, `onboarding`, `recipe-prompt`, `recipe-servings`, `nutrition`, `print-recipe`, `recipe-copy`, `markdown`, `error-handler`, `firestore`, `proxy` |
| CI pipeline | Not shipped | No `.github/workflows` in repo |

### Current user flows (detail)

**Sign up → first generate**
1. User creates account; verification email sent (signup not blocked if unverified — inferred).
2. Redirect to `/generate` (or `?redirect=` target).
3. Mode selector → form → stream → optional save.
4. New users without a profile see an onboarding prompt on `/generate` (skippable).

**Returning user**
1. Auth cookie + Firebase session restored via `AuthListener`.
2. Recipe form inputs may restore from localStorage (`recipe-storage`).
3. Saved recipes fetched client-side with `getUserRecipes` (composite index required).

**Sign out**
1. Cookie cleared, recipe inputs reset, full navigation to `/login`.

### Integrations

| Integration | Usage |
|-------------|--------|
| OpenAI (`gpt-4o`) | Structured recipe generation via `streamObject` |
| Firebase Auth | Email/password, Google |
| Cloud Firestore | `recipes`, `userProfiles` collections |
| Firebase Storage | Initialized only; rules reserved for `users/{userId}/**` |
| Vercel (typical) | Next.js deployment; not configured in repo |

### Architecture summary

- **UI**: App Router; most feature pages are client components using hooks + Zustand.
- **AI**: Single server action `generateRecipe` in `recipe-generation.server.ts`.
- **Data**: Client Firestore SDK; hooks orchestrate reads/writes; Zod validates reads and save payloads.
- **Auth**: Client Firebase Auth + HTTP-only-style cookie for edge proxy; Firestore rules enforce data access.

See [`AGENTS.md`](AGENTS.md) for layer diagram and file map.

### Technical constraints

- Edge proxy cannot verify JWT signatures (no Firebase Admin on Edge).
- Server action `generateRecipe` requires authenticated cookie verified via Firebase REST API.
- Production build requires all `NEXT_PUBLIC_FIREBASE_*` vars; `firebase.ts` throws in production if missing.
- Firestore query `recipes` by `userId` + `orderBy(createdAt desc)` requires a composite index.
- AI schema uses OpenAI strict JSON mode (all fields required in generation schema; nulls for unknown nutrition).
- AGPL-3.0 license affects distribution of modified networked services.

### Known limitations

- **No rate limiting** beyond the client-side generate debounce (`UI_TIMING.AI_GENERATION_DEBOUNCE`); the server action gates on auth but not on volume.
- **No usage quotas** or billing for end users.
- **Legacy nutrition**: Older saved recipes only have nutrition inside markdown `content`; `NutritionSummaryPanel` reads top-level fields, so the panel does not render for pre-persistence documents.
- **Saved recipes** store markdown `content` plus structured fields; legacy recipes may lack optional metadata (schema uses `.passthrough()`).
- **Serving scaling is generate-only** — saved recipes cannot be rescaled from the library yet.
- **Profile onboarding**: First-run banner on `/generate`; skip stored per user in localStorage until profile is saved.
- **Accessibility**: Some patterns present (`aria-live` on recipe display); no audit recorded.

---

## 3. Product Roadmap

Each item is sized for **one focused commit sequence on `dev`** (a single PR-sized change) and ordered by product impact + dependency. Acceptance criteria are testable from a user perspective.

### Recently shipped (do not re-plan)

| Shipped | What |
|---------|------|
| Post-signup preference onboarding | `ProfileOnboardingBanner` → `/profile?welcome=1`; first recipe respects diet/allergies |
| Print-friendly recipe view | `PrintRecipeButton` + `@media print` on generate + saved detail |
| Regenerate / refine | Optional tweak + Regenerate on `RecipeDisplay` |
| Serving-size adjustment (generate) | `scaleRecipeServings` 1–12 on `RecipeDisplay` |
| Nutrition summary panel | `NutritionSummaryPanel` on generate + saved detail; persisted on new saves |
| Authenticated AI generation | `requireAuthenticatedUserId()` gates `generateRecipe` before OpenAI |
| Copy recipe to clipboard | `CopyRecipeButton` + `buildRecipeCopyText` (markdown incl. macros) on generate + saved detail |

---

### Milestone 1 — Serving-size adjustment in the saved library

**User value**: Rescale a saved recipe to tonight's headcount without regenerating or re-paying for AI — completes the half-shipped scaling feature so it works everywhere a recipe is shown.

**Intent**: Surface the existing `NumberInput` + `scaleRecipeServings` controls on `RecipeDetail` (saved view), mirroring `RecipeDisplay`. Scaling is display-only by default; offer an explicit "Save scaled copy" rather than mutating the original document.

**Acceptance criteria**:
- Saved detail shows a servings control (1–12) defaulting to the recipe's stored servings.
- Adjusting servings rescales ingredients/calories using the same util as generate.
- Original saved document is unchanged unless the user explicitly saves a scaled copy.

**Depends on**: `useRecipeServingScale` / `scaleRecipeServings` (already tested).

---

### Milestone 2 — Legacy nutrition backfill on read

**User value**: Older saved recipes show the nutrition panel that newer ones do, so the library feels consistent.

**Intent**: When a saved document lacks top-level `calories`/`macros`, parse them from the markdown `content` on read so `NutritionSummaryPanel` can render. Pure, read-time only; no migration job and no change to the save path.

**Acceptance criteria**:
- Saved detail shows the nutrition panel for pre-persistence recipes whose markdown contains parseable nutrition lines.
- Recipes with neither structured fields nor parseable markdown still hide the panel cleanly.
- New saves are unaffected.

**Depends on**: `nutrition.ts` (extend with a markdown parser + colocated test).

---

### Milestone 3 — Session generation history

**User value**: Generate a few variations and pick the best before saving, instead of losing the previous result on each regenerate.

**Intent**: Keep an in-memory (session-scoped, not localStorage-persisted) list of the last N `structuredRecipe` snapshots while on `/generate`. Let the user select a prior snapshot to restore the display and save it.

**Acceptance criteria**:
- Up to 5 recent generations are listed while on `/generate`.
- Selecting one restores the display and Save works on the selected snapshot.
- History clears on sign-out and via an explicit "Clear history"; never persisted long-term.

**Depends on**: Recipe-store extension (keep AI output out of `persist`/localStorage — see State Management in `AGENTS.md`).

---

### Milestone 4 — Server-side generation rate limit

**User value**: Protects the product's OpenAI budget (and therefore its availability) from runaway or abusive use now that generation is auth-gated but unbounded.

**Intent**: Add a per-user request cap in `requireAuthenticatedUserId()`'s caller / the server action (e.g. short-window counter keyed by uid). Surface the existing rate-limit error path to the user. Keep it minimal and dependency-light; no new infra beyond what the action already has access to.

**Acceptance criteria**:
- A signed-in user exceeding the window receives the existing rate-limit error and no OpenAI call is made.
- Normal usage is unaffected.
- The limit is documented in `AGENTS.md` security notes.

**Depends on**: `server-auth.ts`, `ERROR_MESSAGES.RECIPE.RATE_LIMIT`.

---

### Deferred (not next — README aspirational)

These are **not** current roadmap commitments unless product scope expands:

- Meal planning calendar
- Shopping list generation
- Public recipe community
- Mobile native app
- Voice-guided cooking
- Smart appliance integration
- Unit conversion (metric/imperial) as a standalone toggle — could extend the serving-scale utility

---

## Document maintenance

When shipping a milestone, update the **Feature inventory** table and move the item out of the roadmap. Agent and architecture changes go to [`AGENTS.md`](AGENTS.md) only.
