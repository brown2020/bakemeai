# AGENTS.md — Autonomous Agent Guide for Bake.me

**Bake.me** (`bakemeai`) is an AI-powered recipe web app. Users sign in, set dietary preferences, generate personalized recipes (ingredient-based or dish-specific) via streaming OpenAI output, and save favorites to Firestore.

**Publisher**: Ignite Channel Inc · **License**: AGPL-3.0

Read this file before making changes. Product direction lives in [`spec.md`](spec.md).

---

## Product Purpose

Help home cooks turn what they have (or what they crave) into actionable recipes tailored to dietary needs, allergies, experience level, and cuisine preferences — then keep a personal recipe library.

---

## Tech Stack (current)

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16 (App Router, RSC, Turbopack) | `src/proxy.ts` for route protection |
| UI | React 19, Tailwind CSS v4, `@tailwindcss/typography` | Custom UI primitives in `src/components/ui/` |
| Language | TypeScript 6 (strict) | Path alias `@/*` → `./src/*` |
| AI | Vercel AI SDK 6, `@ai-sdk/openai`, `@ai-sdk/rsc` | `streamObject` + Zod schema, model `gpt-4o` |
| Backend | Firebase Auth, Firestore, Storage (init only) | Client SDK; rules enforce ownership |
| State | Zustand 5 (`persist` on recipe inputs only) | Three stores |
| Validation | Zod 4 | Schemas in `src/lib/schemas/` |
| Lint | ESLint 10 flat config | No Prettier npm script |
| Package manager | **npm** (`package-lock.json`, `.npmrc` `legacy-peer-deps=true`) | Do not switch managers |
| Tests | Vitest 3 (`node` env, `src/**/*.test.ts`) | Pure-util unit tests only; no E2E/component runner |

**Not present**: REST API routes (`src/app/api/`), CI workflows (`.github/`), background jobs/cron/queues, E2E/browser tests. The only server entry point is the `generateRecipe` server action.

---

## Repository Structure

```
src/
├── app/                    # Routes (App Router)
│   ├── layout.tsx          # RSC root: AuthListener, Navbar, Footer, global ErrorBoundary
│   ├── page.tsx            # Landing (RSC; HeroCTA is client)
│   ├── generate/           # Protected — AI recipe generation
│   ├── saved/              # Protected — recipe library
│   ├── profile/            # Protected — dietary preferences
│   ├── login/, signup/, reset-password/
│   └── about/, privacy/, terms/, support/
├── components/             # Shared UI, auth, MarkdownRenderer, ErrorBoundary
├── hooks/                  # Orchestration (generation, save, Firestore query, profile)
├── lib/
│   ├── recipe-generation.server.ts   # "use server" — OpenAI streaming
│   ├── services/recipe-service.ts    # Client-side service wrappers
│   ├── db/                           # Firestore CRUD (recipes, profiles)
│   ├── schemas/                      # Zod + inferred types
│   ├── store/                        # Zustand (pure state)
│   ├── constants/                    # auth, domain, ui
│   └── utils/                        # errors, logger, markdown, sanitize, cookies
└── proxy.ts                # Edge route protection (JWT expiry only, unsigned)
firestore.rules, storage.rules
```

Nested READMEs in `src/app/` and `src/lib/` supplement export/client conventions; architecture detail is here and in [`spec.md`](spec.md).

---

## Core Architecture

```
Components → Hooks → Services → DB / Server Actions (AI)
           ↘       ↘
            Stores (pure UI state)
            Utils (pure functions)
```

| Layer | Responsibility | Must not |
|-------|----------------|----------|
| Components | Render UI, wire events | Business logic, direct Firestore |
| Hooks | Orchestrate validation, async, store updates | Own persistent business rules |
| Services / server actions | AI calls, save/delete logic | Hold React state |
| Stores | UI state, persistence of inputs | API calls, validation |
| `lib/db/` | Firestore CRUD, throws `AppError` | Be called from components directly |

**Error contract**: Service throws `AppError` → hook catches, `logError`, `convertErrorToMessage` → store/local state → `<ErrorMessage />`.

---

## Key Features (shipped today)

1. **Auth** — Email/password + Google; remember-me; email verification on signup; password reset; auth cookie `bakemeai_firebaseAuth`.
2. **Profile** — Dietary tags, allergies, disliked ingredients, cuisines, experience, default serving size → fed into AI system prompt.
3. **Post-signup onboarding** — `ProfileOnboardingBanner` on `/generate` when no `userProfiles/{uid}` doc exists; skip persisted per-user in localStorage (`useProfileOnboarding`).
4. **Generate** — Two modes (`specific` | `ingredients`); streaming structured JSON; debounced submit (`UI_TIMING.AI_GENERATION_DEBOUNCE`); AbortController cancels stale streams. Server action **requires an authenticated user** before calling OpenAI.
5. **Regenerate / refine** — Optional tweak field + Regenerate button on `RecipeDisplay`; reuses inputs via `appendTweakToPrompt` and resets save state (`useRecipeGeneration.handleRegenerate`).
6. **Serving-size adjustment** — `NumberInput` (1–12) + `scaleRecipeServings` deterministically rescales ingredients/calories on `/generate` (`useRecipeServingScale`); generate page only, not saved detail.
7. **Nutrition panel** — `NutritionSummaryPanel` renders calories/macros above markdown on generate + saved detail when `extractNutritionSummary` finds data; `saveRecipe` persists `calories`/`macros` top-level when present.
8. **Save** — Validates `completeRecipeStructureSchema` before Firestore write; markdown derived via `convertToMarkdown`.
9. **Saved library** — List, search (title/ingredients), detail panel, optimistic delete with rollback (`saved/page.tsx`).
10. **Print / export** — `PrintRecipeButton` on generate (after stream completes) + saved detail; `@media print` rules in `globals.css` isolate `.recipe-printable`.
11. **Static pages** — Landing, about, privacy, terms, support.
12. **Route protection** — `proxy.ts` soft-gates `/generate`, `/profile`, `/saved`; Firestore rules are the real security boundary.

**Partial / unused (inferred)**:
- Firebase Storage initialized + rules exist; no upload UI.
- `user-profile-store` used only via `useUserProfile`; profile page uses `useFirestoreQuery` directly instead.
- Legacy saved recipes created before nutrition persistence have data only in markdown body; the panel reads top-level fields, so older recipes may not show it.

---

## Important Commands

```bash
npm install          # Install dependencies (use lockfile; .npmrc sets legacy-peer-deps)
npm run dev          # Dev server (Next 16 / Turbopack default)
npm run build        # Production build (requires NEXT_PUBLIC_FIREBASE_* + OPENAI_API_KEY in prod)
npm run start        # Serve production build
npm run lint         # ESLint 10 flat config
npm run test         # Vitest unit tests (single run, CI-safe)
```

There is no `npm run typecheck` (type errors surface via `next build`) and no Prettier npm script (`.prettierrc.json` is editor/pre-commit only).

---

## Canonical Validation (CI-safe, non-interactive)

Run before committing:

```bash
npm run lint
npm run test
npm run build
```

**Rules**:
- Never use watch mode, headed browsers, or interactive prompts.
- Do not rely on manual Firebase login for validation.
- If `build` fails due to missing env vars, set placeholder `NEXT_PUBLIC_FIREBASE_*` and `OPENAI_API_KEY` values locally — do not commit secrets.
- Document in commit/PR notes when checks were skipped and why.

---

## Development Conventions

### TypeScript & lint
- Strict mode; avoid `any`.
- ESLint 10 flat config (`eslint.config.mjs`); no type-aware lint pass.
- Prettier: 2-space, semi, double quotes, LF, 80 cols (`.prettierrc.json`) — editor/pre-commit only.

### Exports
- **Default**: pages, layouts, `global-error.tsx`, `proxy.ts` default export.
- **Named**: all reusable components, hooks, services, db, utils.

### Import order
1. External packages  
2. `@/` absolute imports  
3. Relative imports  
4. `import type` grouped with its category  

### Naming
- DB: `get*`, `save*`, `delete*`
- Services: verb + noun (`generateRecipeWithStreaming`)
- Hooks: `use*`, return named object (not tuple)
- Utils: `get*`, `convert*`, `is*`, domain verbs
- Reserved: `fetch*` (client fetching only), `handle*` / `on*` (components)

### Comments
- JSDoc on exported functions is common in `lib/`; do not add noise comments on obvious code.

---

## Server / Client Boundary

- **Default RSC** — no `"use client"` unless needed.
- **`"use client"` on line 1** for: hooks, Zustand, Firebase auth, browser APIs, event handlers.
- **Server actions**: `src/lib/recipe-generation.server.ts` (`"use server"`) — only AI entry point; no REST API layer.
- **Serialization**: Pass `SerializableAuthUser` / `SerializableUserProfile` across server boundaries; strip Firestore `Timestamp` before server actions.
- **Markdown**: Always `MarkdownRenderer`; never `dangerouslySetInnerHTML` for user/AI content.

---

## Route Protection

Constants: `src/lib/constants/auth.ts` (`PRIVATE_ROUTES`, `AUTH_PAGES`).

| Kind | Paths | Behavior |
|------|-------|----------|
| Private | `/generate`, `/profile`, `/saved` | Redirect to `/login?redirect=` if no valid cookie |
| Auth pages | `/login`, `/signup`, `/reset-password` | Redirect to `/generate` if authenticated |
| Public | `/`, `/about`, `/privacy`, `/terms`, `/support` | Open |

**Critical**: `proxy.ts` `config.matcher` must stay in sync with constants (dev drift check logs error).

**Security**: Proxy validates JWT **expiry only** (no signature — Firebase Admin is unavailable on Edge). Real enforcement has two layers:
- **Data**: Firestore rules (`userId === request.auth.uid`); default-deny on everything else.
- **AI cost**: `generateRecipe` calls `requireAuthenticatedUserId()` (`lib/utils/server-auth.ts`), which reads the auth cookie and verifies it via the Firebase Identity Toolkit REST API (unsigned expiry fallback only in `development` when the API key is absent). Unauthenticated calls throw before OpenAI is hit.

Remaining hardening (rate limiting, per-user quotas) is product work — see `spec.md`.

---

## State Management

| Store | Persists | Notes |
|-------|----------|-------|
| `auth-store` | No | Driven by `AuthListener` |
| `recipe-store` | `input`, `ingredients`, `mode` only | Never persist generated recipes |
| `user-profile-store` | No | Cache for `useUserProfile` |

Use `selectDisplayRecipe(structuredRecipe)` for derived display data. `setMode(null)` clears generation state.

Race patterns in use: AbortController (generation, auth token fetch), version refs (`useFirestoreQuery`), save ref-guard (`useRecipeSave`), optimistic delete rollback (`saved/page.tsx`).

---

## Testing Expectations

Vitest is configured (`vitest.config.ts`, `node` environment, glob `src/**/*.test.ts`, `@` alias). `npm run test` runs once and is CI-safe — never use watch mode.

Current coverage is **pure-function unit tests only**, colocated next to their source:
`jwt`, `route-match`, `onboarding`, `recipe-prompt`, `recipe-servings`, `nutrition`, `print-recipe`.

When extending tests, keep targeting deterministic boundaries first: `lib/utils/`, `lib/schemas/`, store selectors. Firebase, the OpenAI server action, and React components are **not** unit-tested — do not add tests that require network, Firebase, or a browser/component runner unless the task explicitly asks for that infrastructure. Cover new pure utilities with a colocated `*.test.ts`.

---

## Files & Systems Requiring Extra Caution

| Area | Why |
|------|-----|
| `src/proxy.ts` + `constants/auth.ts` | Matcher drift breaks route protection UX |
| `firestore.rules` / `storage.rules` | Production data access |
| `src/lib/recipe-generation.server.ts` + `src/lib/utils/server-auth.ts` | OpenAI cost; the auth gate that protects it |
| `src/lib/schemas/recipe.ts` | Streaming vs save validation contract (`recipeStructureSchema` vs `completeRecipeStructureSchema`) |
| `src/lib/utils/sanitize.ts` | XSS surface for markdown |
| `src/components/AuthListener.tsx` | Auth race conditions |
| `src/lib/store/recipe-store.ts` | Persistence scope — never persist AI output |
| `package-lock.json` | npm-only; lock intentional dependency versions |

Do not modify generated files (`.next/`) unless source requires it.

---

## Git Workflow (main / dev)

| Branch | Role |
|--------|------|
| `main` | Stable production — **never push directly from autonomous runs** |
| `dev` | Autonomous working branch — commit and push here |

**Autonomous runs**:
- Work on `dev` only; no feature branches; no PRs unless explicitly requested.
- Before starting: `git fetch origin && git checkout dev && git pull origin dev`.
- One **PR-sized, focused change** per run (single concern), even when committing directly to `dev`.
- Commit message style: concise imperative (`fix:`, `feat:`, `docs:`, `chore:`).
- Do not force-push, amend unless user rules allow, or push to `main`.

---

## Definition of Done

1. Change matches task scope; no unrelated refactors.
2. Follows layer boundaries and error-handling contract.
3. `npm run lint` passes.
4. `npm run build` passes (or skip reason documented).
5. No secrets committed; env vars documented if new.
6. User-facing copy uses Bake.me branding consistently.
7. If touching routes/auth: matcher and constants stay aligned.

---

## Rules for Autonomous Codex Runs

**Do**
- Read `spec.md` for product intent before feature work.
- Inspect code; do not trust stale README structure (`lib/actions.ts`, `lib/db.ts` references are obsolete).
- Use existing hooks/services rather than duplicating orchestration in components.
- Prefer specific imports from `lib/constants/*` over barrel when tree-shaking matters.
- Clear invalid auth cookies on sign-out paths consistently with existing patterns.

**Don't**
- Switch package managers or add yarn/pnpm lockfiles.
- Put async/business logic in Zustand stores.
- Fetch Firestore in component `useEffect` — use `useFirestoreQuery` / `useUserProfile`.
- Store raw Firebase `User` in global state.
- Invent major product pivots unsupported by the app (meal planning app, social network, etc.).
- Batch unrelated changes in one commit sequence.

---

## Stop Conditions

Stop and report (do not guess) when:

- Uncommitted changes exist that are not yours and may conflict — document and halt.
- `dev` cannot be fast-forwarded safely without user direction.
- Build/lint fails for reasons outside task scope and cannot be fixed minimally.
- Task requires secrets, production Firebase, or OpenAI keys you do not have.
- Change would require pushing to `main` or opening a PR when instructions forbid it.
- Ambiguous product direction — consult `spec.md`; if still unclear, stop with questions.

---

## Key File Cheat Sheet

| Purpose | File |
|---------|------|
| AI server action | `src/lib/recipe-generation.server.ts` |
| Server-side auth gate | `src/lib/utils/server-auth.ts` |
| System prompt | `src/lib/prompts.ts` |
| Recipe service | `src/lib/services/recipe-service.ts` |
| Firestore recipes | `src/lib/db/recipes.ts` |
| Firestore profiles | `src/lib/db/profiles.ts` |
| Recipe schemas | `src/lib/schemas/recipe.ts` |
| Generation hook (generate + regenerate) | `src/hooks/useRecipeGeneration.ts` |
| Serving-scale hook | `src/hooks/useRecipeServingScale.ts` |
| Onboarding hook | `src/hooks/useProfileOnboarding.ts` |
| Serving / nutrition / print utils | `src/lib/utils/recipe-servings.ts`, `nutrition.ts`, `print-recipe.ts` |
| Auth listener | `src/components/AuthListener.tsx` |
| Auth form | `src/components/auth/AuthForm.tsx` |
| Route proxy | `src/proxy.ts` |
| Product roadmap | `spec.md` |
