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
| Package manager | **npm** (`package-lock.json`) | Do not switch managers |

**Not present**: API routes (`src/app/api/`), test runner, CI workflows, background jobs/cron, `.env.example` in repo (`.env*` gitignored).

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
3. **Generate** — Two modes (`specific` | `ingredients`); streaming structured JSON; debounced submit; AbortController cancels stale streams.
4. **Save** — Validates `completeRecipeStructureSchema` before Firestore write; markdown derived via `convertToMarkdown`.
5. **Saved library** — List, search (title/ingredients), detail panel, optimistic delete with rollback.
6. **Static pages** — Landing, about, privacy, terms, support.
7. **Route protection** — `proxy.ts` soft-gates `/generate`, `/profile`, `/saved`; Firestore rules are the real security boundary.

**Partial / unused (inferred)**:
- `calories` / `macros` generated and stored in markdown when present, but no dedicated nutrition UI.
- Firebase Storage initialized + rules exist; no upload UI.
- `user-profile-store` used only via `useUserProfile`; profile page uses `useFirestoreQuery` directly instead.

---

## Important Commands

```bash
npm install          # Install dependencies (use lockfile)
npm run dev          # Dev server (Turbopack)
npm run build        # Production build (requires env vars in prod mode)
npm run start        # Serve production build
npm run lint         # ESLint
```

There is no `npm test`, `npm run typecheck`, or Prettier script.

---

## Canonical Validation (CI-safe, non-interactive)

Run before committing:

```bash
npm run lint
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

**Security**: Proxy validates JWT **expiry only** (no signature). Real enforcement is Firestore rules (`userId === request.auth.uid`). The `generateRecipe` server action does **not** verify auth today — treat cost/abuse hardening as product work (see `spec.md`).

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

**No test infrastructure exists.** Do not add tests unless the task explicitly requests them.

When tests are introduced, prefer boundaries: `lib/services/`, `lib/utils/`, `lib/schemas/`, store selectors, then hooks with mocks, then E2E for auth + generate + save.

---

## Files & Systems Requiring Extra Caution

| Area | Why |
|------|-----|
| `src/proxy.ts` + `constants/auth.ts` | Matcher drift breaks route protection UX |
| `firestore.rules` / `storage.rules` | Production data access |
| `src/lib/recipe-generation.server.ts` | OpenAI cost; no auth gate |
| `src/lib/schemas/recipe.ts` | Streaming vs save validation contract |
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
| System prompt | `src/lib/prompts.ts` |
| Recipe service | `src/lib/services/recipe-service.ts` |
| Firestore recipes | `src/lib/db/recipes.ts` |
| Firestore profiles | `src/lib/db/profiles.ts` |
| Recipe schemas | `src/lib/schemas/recipe.ts` |
| Generation hook | `src/hooks/useRecipeGeneration.ts` |
| Auth listener | `src/components/AuthListener.tsx` |
| Auth form | `src/components/auth/AuthForm.tsx` |
| Route proxy | `src/proxy.ts` |
| Product roadmap | `spec.md` |
