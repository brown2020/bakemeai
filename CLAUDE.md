# CLAUDE.md - AI Assistant Guide for Bake.me

## Project Overview

**Bake.me** is an AI-powered recipe generation web application. Users can generate personalized recipes in two modes: based on ingredients they have on hand, or for a specific dish they want to make. Recipes are streamed as structured JSON from OpenAI, validated with Zod, and optionally saved to Firestore. User profiles store dietary restrictions, allergies, disliked ingredients, preferred cuisines, cooking experience, and default serving size to personalize generation.

**Publisher**: Ignite Channel Inc • **License**: AGPL-3.0

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, RSC, Turbopack) | ^16.0.0 |
| UI | React | ^19.1.1 |
| Language | TypeScript | ^6.0.2 |
| Styling | Tailwind CSS v4 (+ `@tailwindcss/typography`) | ^4.1.12 |
| Icons | `lucide-react` | ^1.7.0 |
| Component variants | `class-variance-authority`, `clsx` | 0.7.1 / ^2.1.1 |
| Markdown | `react-markdown` | 10.1.0 |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/rsc`, `@ai-sdk/react`), `openai` | 6.x / 3.x / 2.x |
| Backend | Firebase (Auth, Firestore, Storage) | ^12.1.0 |
| Cookies | `js-cookie` | 3.0.5 |
| State | Zustand (with `persist` middleware) | ^5.0.8 |
| Validation | Zod | ^4.1.12 |
| Lint | ESLint 10 (flat config, `eslint-config-next`) | ^10.2.0 |
| Format | Prettier (2-space, semi, double quotes, LF, 80 cols) | — |

Path alias: `@/* -> ./src/*`.

## Quick Commands

```bash
npm run dev      # Start dev server (Next.js + Turbopack)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint (flat config)
```

No test runner is configured. No Prettier script (rely on editor / pre-commit).

## Environment Variables

Copy `.env.example` → `.env.local` and populate:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
# Optional: NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=true   # enables logger output in prod
```

- In **production**, `src/lib/firebase.ts` throws on missing Firebase config.
- In **development**, it logs a warning instead (Turbopack env timing).

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (RSC) + ErrorBoundary(global) + AuthListener + Navbar + Footer
│   ├── page.tsx                      # Landing page (RSC; only HeroCTA is "use client")
│   ├── global-error.tsx              # Root-level Next.js error boundary
│   ├── globals.css                   # Tailwind v4 + custom @theme tokens (primary/surface/animations)
│   ├── generate/                     # Recipe generation (protected)
│   │   ├── page.tsx                  # Orchestrates ModeSelector → RecipeForm → RecipeDisplay
│   │   ├── types.ts                  # Page-scoped prop types
│   │   ├── constants.ts              # RECIPE_PROMPTS, CARD_STYLES
│   │   └── components/               # ModeSelector, RecipeForm, FormInput, RecipeDisplay, ErrorMessage(re-export)
│   ├── saved/                        # Saved recipes (protected)
│   │   ├── page.tsx                  # List + detail layout, optimistic delete
│   │   └── components/               # RecipeList, RecipeDetail, RecipeSearch, EmptyState, LoadingSkeleton
│   ├── profile/page.tsx              # Dietary preferences form (protected)
│   ├── login/page.tsx, signup/page.tsx, reset-password/page.tsx
│   └── about/, privacy/, terms/, support/   # Static marketing/legal pages
│
├── components/                       # Shared components
│   ├── AuthListener.tsx              # "use client" — syncs Firebase auth → store + cookie
│   ├── Navbar.tsx                    # "use client" — nav + sign-out
│   ├── UserMenu.tsx                  # User avatar dropdown
│   ├── Footer.tsx, PageLayout.tsx, HeroCTA.tsx
│   ├── ErrorBoundary.tsx             # Class component, variant: "global" | "feature"
│   ├── ReloadButton.tsx              # Reload helper for error boundaries
│   ├── MarkdownRenderer.tsx          # memo'd; sanitizes + disallows unsafe elements
│   ├── RecipeCard.tsx, Button.tsx
│   ├── auth/                         # AuthForm (unified login/signup), AuthFormWithRedirect (Suspense + ?redirect=), GoogleSignInButton
│   ├── icons/FeatureIcons.tsx        # LightningIcon, CakeIcon, HeartIcon
│   └── ui/                           # Input+Textarea, ChipSelect, TagInput, NumberInput,
│                                     # ConfirmDialog, NavLink, LoadingSpinner, PageSkeleton+CardSkeleton, ErrorMessage
│
├── hooks/                            # Custom hooks
│   ├── useRecipeGeneration.ts        # Orchestrates validation → streaming → store updates (AbortController)
│   ├── useRecipeSave.ts              # Save with `savingRef` duplicate guard
│   ├── useFirestoreQuery.ts          # Generic Firestore query; request version tracking
│   ├── useUserProfile.ts             # Profile fetch + Timestamp stripping
│   ├── useGoogleAuth.ts              # Google popup sign-in
│   └── useDebounce.ts                # Generic debounce helper
│
├── lib/
│   ├── firebase.ts                   # Firebase app/auth/db/storage + GoogleAuthProvider; silent SDK logs on client
│   ├── recipe-generation.server.ts   # "use server" streamObject({ model: openai("gpt-4o"), temperature: 0 })
│   ├── prompts.ts                    # getRecipeSystemPrompt(isIngredientBased, userProfile?)
│   ├── services/recipe-service.ts    # generateRecipeWithStreaming, saveRecipeToDatabase, deleteRecipeFromDatabase
│   ├── db/                           # Firestore CRUD (throwing contract)
│   │   ├── index.ts                  # Barrel export
│   │   ├── recipes.ts                # saveRecipe, getUserRecipes, deleteRecipe
│   │   └── profiles.ts               # saveUserProfile (sanitized), getUserProfile
│   ├── schemas/                      # Zod schemas + inferred types
│   │   ├── recipe.ts                 # recipeSchema, recipeStructureSchema, completeRecipeStructureSchema, RecipeMode
│   │   ├── user.ts                   # userProfileSchema + serializable/input variants
│   │   ├── auth.ts                   # serializableAuthUserSchema + toSerializableAuthUser()
│   │   └── validation.ts             # emailSchema, passwordSchema
│   ├── store/                        # Zustand stores (no business logic)
│   │   ├── auth-store.ts             # user, isLoading
│   │   ├── recipe-store.ts           # generation + saving state + selectDisplayRecipe selector; persists input/ingredients/mode
│   │   └── user-profile-store.ts     # profile cache
│   ├── constants/
│   │   ├── auth.ts                   # FIREBASE_AUTH_COOKIE, LEGACY_FIREBASE_AUTH_COOKIE, PRIVATE_ROUTES, AUTH_PAGES, COOKIE_CONFIG, JWT_VALIDATION_CONFIG
│   │   ├── domain.ts                 # COLLECTIONS, DIETARY_OPTIONS, CUISINE_OPTIONS, EXPERIENCE_LEVELS
│   │   ├── ui.ts                     # FORM_VALIDATION, UI_TIMING, NUMBER_INPUT, LAYOUT, RECIPE
│   │   └── index.ts                  # Barrel
│   └── utils/
│       ├── error-handler.ts          # AppError, ERROR_MESSAGES, convertErrorToMessage, isAppError, FIREBASE_ERROR_MESSAGES
│       ├── logger.ts                 # logError, logWarning, logInfo (env-gated; JSON in prod)
│       ├── auth.ts                   # setUserAuthToken(user)
│       ├── auth-cookies.ts           # setAuthCookieToken, clearAuthCookie, deleteAuthCookies(response)
│       ├── firestore.ts              # getFirestoreErrorMessage, requiredTimestampSchema, firestoreTimestampSchema
│       ├── markdown.ts               # convertToMarkdown, formatRecipeBodyAsMarkdown
│       ├── navigation.ts             # isSafeRedirectPath, getSafeRedirectPath
│       └── sanitize.ts               # sanitizeMarkdown, sanitizeUserInput, MARKDOWN_DISALLOWED_ELEMENTS
│
└── proxy.ts                          # Next.js 16 Proxy (Edge); unsigned JWT expiry check on auth cookie
```

Other root-level files:
- `firestore.rules` — default-deny; per-doc ownership by `userId` field; `userProfiles/{uid}` doc id === `uid`.
- `storage.rules` — default-deny; `users/{userId}/**` owner-only (reserved for future use).
- `next.config.ts` — `reactStrictMode: true`; remote image patterns for `firebasestorage.googleapis.com`, `storage.googleapis.com`, `**.googleusercontent.com`, `images.unsplash.com`.
- `README.md`, `ARCHITECTURE.md` — end-user / contributor documentation.

## Routing & Route Protection

Routes are protected by `src/proxy.ts` (Next.js 16 "Proxy" — the successor to `middleware.ts`).

| Kind | Paths | Behavior |
|------|-------|---------|
| **Private** (`PRIVATE_ROUTES`) | `/generate`, `/profile`, `/saved` | Redirect to `/login?redirect=<path>` if no valid auth cookie; clear cookies on invalid |
| **Auth pages** (`AUTH_PAGES`) | `/login`, `/signup`, `/reset-password` | Redirect to `/generate` if already authenticated; clear invalid cookies and stay |
| **Public** | `/`, `/about`, `/privacy`, `/terms`, `/support` | Always accessible |

**Important security note**: The proxy does **unsigned** JWT expiry validation only (no signature verification — Edge runtime has no Firebase Admin SDK). It exists for UX (prevent flashes of protected content) and a soft gate. **All real auth is enforced server-side by Firestore rules** (`resource.data.userId === request.auth.uid`).

The proxy matcher is declared statically in `src/proxy.ts` and manually kept in sync with `PRIVATE_ROUTES` / `AUTH_PAGES` constants (there's a dev-only drift check that logs an error if they diverge).

## AI Recipe Generation Flow

1. **Component** (`app/generate/page.tsx`) renders `ModeSelector` → `RecipeForm` → `RecipeDisplay` based on `mode` in `recipe-store`.
2. **Hook** `useRecipeGeneration(userProfile)`:
   - Validates input with `specificRecipeInputSchema` or `ingredientsRecipeInputSchema` (Zod).
   - Rate-limits via `lastSubmitTimeRef` + `UI_TIMING.AI_GENERATION_DEBOUNCE` (500ms).
   - Aborts any in-flight generation (`AbortController`) before starting a new one.
   - Calls `generateRecipeWithStreaming(...)` with `signal`.
3. **Service** `generateRecipeWithStreaming` (client-callable wrapper):
   - Invokes the `"use server"` action `generateRecipe()`.
   - Reads the streamable value with `readStreamableValue` and validates each partial with `recipeStructureSchema` (all fields optional during streaming).
   - On each valid partial, calls `onPartialUpdate(recipe)` → store → re-render.
4. **Server action** `generateRecipe` (`src/lib/recipe-generation.server.ts`):
   - `streamObject({ model: openai("gpt-4o"), schema: recipeGenerationSchema (strict, required, additionalProperties:false), system: getRecipeSystemPrompt(...), prompt, temperature: 0 })`.
   - Returns `createStreamableValue(result.partialObjectStream).value`.
5. **Save** (`useRecipeSave.saveRecipe(userId)`): runs `completeRecipeStructureSchema` (full required fields, `ingredients.min(1)`, `instructions.min(1)`) before persisting. Missing fields → user sees "Recipe is incomplete…".

Display pipeline: `structuredRecipe` (source of truth) → `selectDisplayRecipe(structuredRecipe)` → `{ title, content (markdown from `formatRecipeBodyAsMarkdown`) }` → `MarkdownRenderer` (sanitized + disallowed elements).

## State Management (Zustand)

All stores are **pure state**. Orchestration lives in hooks, business logic in services.

| Store | Shape | Persistence |
|-------|-------|-------------|
| `auth-store` | `{ user: SerializableAuthUser \| null, isLoading }` | None (driven by Firebase listener) |
| `recipe-store` | Generation state, save state, inputs, mode, `structuredRecipe` + `selectDisplayRecipe` selector | `persist({ name: "recipe-storage", partialize: { input, ingredients, mode } })` — **never** persists generated recipes |
| `user-profile-store` | `{ userProfile, isLoading, error }` | None |

Important store actions:
- `recipe-store.setMode(mode)` also clears generated recipe / errors / in-flight flags.
- `recipe-store.resetUserInput()` — used on sign-out; preserves pending async flags to avoid UI flicker.
- `recipe-store.resetAll()` — full reset (testing / dev tools).

## Authentication Flow

- `lib/firebase.ts` initializes `auth`, `db`, `storage`, `googleProvider`; silences Firebase SDK logs on the client.
- `components/AuthListener.tsx` (`"use client"`, mounted in root layout):
  - Subscribes to `onIdTokenChanged(auth, ...)`.
  - On user → `toSerializableAuthUser(user)` into store + `setUserAuthToken(user)` → cookie.
  - On sign-out → `clearAuthCookie()` + `recipe-store.resetUserInput()`.
  - **Race-condition protection**: `versionRef` + `AbortController` invalidate stale token fetches when auth state changes rapidly.
- `components/auth/AuthForm.tsx` (unified login+signup):
  - Email/password, Google (via `useGoogleAuth`), optional remember-me (`browserLocalPersistence` vs `browserSessionPersistence`), email verification on signup.
  - Uses `getSafeRedirectPath(?redirect=...)` to prevent open-redirect exploits (`//evil.com`, `foo//bar`, absolute URLs are rejected).
- `Navbar.tsx` sign-out clears cookie + local state **before** `auth.signOut()`, then `window.location.assign("/login")` to drop any prefetched protected payloads.

**Auth cookie**: `bakemeai_firebaseAuth` (namespaced) with `SameSite=Strict`, `Secure` in prod, 7-day expiry. `LEGACY_FIREBASE_AUTH_COOKIE = "firebaseAuth"` is cleared too for backwards compatibility.

## Architecture Layers & Data Flow

```
Components → Hooks → Services → Database/AI
           ↘      ↘           ↘
            Stores (pure state)
            Utilities (pure functions)
```

| Layer | Path | Responsibility |
|-------|------|----------------|
| Components | `src/app/**`, `src/components/**` | UI, event handlers. Prefer RSC; `"use client"` only when needed |
| Hooks | `src/hooks/**` | Orchestration, validation, coordination of services + stores |
| Services | `src/lib/services/**`, `src/lib/recipe-generation.server.ts` | Business logic, AI/DB calls |
| Stores | `src/lib/store/**` | UI state only (no fetching, no validation) |
| DB | `src/lib/db/**` | Firestore CRUD; throws `AppError` with user-friendly messages |
| Schemas | `src/lib/schemas/**` | Zod — source of truth for types (`z.infer`) |
| Utils | `src/lib/utils/**` | Pure helpers (markdown, sanitize, cookies, navigation, firestore mapping, logger, error-handler) |
| Constants | `src/lib/constants/**` | Immutable config, tree-shakable per-file imports preferred |

### Error-handling contract

```
Service throws AppError   → Hook catches, logs (logError), converts (convertErrorToMessage)   → Store/local state   → Component displays via <ErrorMessage />
```

- `AppError(message, code?, context?)` — always thrown upward.
- All user-facing strings live in `ERROR_MESSAGES` (`lib/utils/error-handler.ts`). Inline strings are allowed only for debug logs.
- Firebase error codes (`auth/*`, Firestore codes) are auto-mapped via `FIREBASE_ERROR_MESSAGES` / `FIRESTORE_ERROR_MESSAGES`.
- `logger.ts` is env-gated: console in dev; structured JSON in prod only when `NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=true`.

## Firestore Data Model

| Collection | Doc ID | Fields | Notes |
|-----------|--------|--------|-------|
| `recipes` | auto | `userId`, `title`, `content` (markdown), `createdAt` (serverTimestamp), `ingredients[]`, `preparationTime`, `cookingTime`, `servings`, `difficulty` (+ legacy fields allowed via `.passthrough()`) | Owner via `userId` field; queried with `orderBy("createdAt","desc")` → requires composite index on `(userId ASC, createdAt DESC)` |
| `userProfiles` | `uid` | `dietary[]`, `allergies[]` (sanitized), `dislikedIngredients[]` (sanitized), `cookingExperience` (beginner/intermediate/advanced), `servingSize` (1–12), `preferredCuisines[]`, `updatedAt` | Owner by document id |

Timestamp handling (`lib/utils/firestore.ts`): `requiredTimestampSchema` accepts `Timestamp`, `{ seconds, nanoseconds }`, or `number` (legacy). `firestoreTimestampSchema` is optional and strictly `Timestamp`.

## Race-Condition Patterns In Use

- **AbortController in `useRecipeGeneration`** — cancel in-flight stream when a new one starts.
- **AbortController + version tracking in `AuthListener`** — invalidate stale token fetches.
- **Version tracking in `useFirestoreQuery`** (`requestVersionRef`) — only the latest request updates state when `userId` changes rapidly.
- **Save ref-guard in `useRecipeSave`** (`savingRef.current`) — prevents duplicate concurrent saves (state updates are async and can't block re-entry).
- **Optimistic delete with rollback in `app/saved/page.tsx`** — if both delete and refetch fail, re-insert the deleted item client-side and show a "page may be out of sync" message.

## UI / Component Conventions

- **Exports**: Default for pages/layouts/errors (Next.js requirement), **named** for everything else.
- **Client vs server**: RSC by default. `"use client"` on **line 1** only when necessary (hooks, event handlers, Firebase auth, browser APIs, Zustand). Root layout is RSC; client work is isolated to `AuthListener`, `Navbar`, `HeroCTA`, `ErrorBoundary`, etc.
- **Memoization**: Apply `React.memo` for:
  - List items rendered in large collections (`RecipeCard`, `RecipeList`)
  - Expensive renderers inside streaming parents (`MarkdownRenderer`, `RecipeDisplay`)
  - Detail views with expensive children (`RecipeDetail`)
- **Error boundaries**: `<ErrorBoundary variant="global">` in root layout; `<ErrorBoundary variant="feature" featureName="..." />` wraps each major section inside pages.
- **Button**: `class-variance-authority` variants (`primary | secondary | ghost`, `sm | md | lg`) + `isLoading` with spinner and `aria-busy`.
- **Forms**: `Input` / `Textarea` (forwardRef, auto-id from label), `ChipSelect`, `TagInput`, `NumberInput`, `ConfirmDialog` (keyboard + focus management). Native `<dialog>` is not used — custom accessible modal.
- **Markdown**: Always render via `MarkdownRenderer`. Never render user/AI content via `dangerouslySetInnerHTML`.

## Naming Conventions

- **Database** (`lib/db/`): `get*`, `save*`, `delete*` (e.g., `getUserRecipes`, `saveRecipe`).
- **Services** (`lib/services/`): verb + noun (`generateRecipeWithStreaming`, `saveRecipeToDatabase`).
- **Hooks**: `use*`, return named-property objects (no positional arrays).
- **Utilities**: `get*` / `convert*` / `is*` / domain verbs (`sanitizeMarkdown`, `formatRecipeBodyAsMarkdown`).
- **Reserved**: `fetch*` (client data fetching only, not DB layer), `handle*` / `on*` (event handlers / callback props in components).
- **Types**: `type` for unions / Zod infers / intersections; `interface` for object shapes / component props / store state.

## Import Ordering

```
1. External packages (react, next, firebase, zod, ...)
2. Absolute @/ imports (hooks, lib, components)
3. Relative imports (./, ../)
4. Type-only imports can be grouped with their category (`import type { ... }`)
```

## Coding Do / Don't

**Do**
- Keep stores pure; put orchestration in hooks, logic in services, data in `lib/db`.
- Validate every Firestore read with Zod (`safeParse`); throw `AppError` on failure.
- Use `convertErrorToMessage(error, ERROR_MESSAGES.X.Y)` in the hook layer.
- Use `SerializableAuthUser` / `SerializableUserProfile` when crossing the SSR / server-action boundary (Firestore `Timestamp` and Firebase `User` are not serializable).
- Prefer selectors over store methods for derived data (`selectDisplayRecipe`).
- Prefer specific-file imports from `lib/constants/*` (tree-shaking) over the barrel.

**Don't**
- Don't put business logic or async calls in stores.
- Don't fetch data in `useEffect` inside components — use the provided hooks (`useFirestoreQuery`, `useUserProfile`).
- Don't store the raw Firebase `User` object.
- Don't add Prettier/ESLint overrides without updating `.prettierrc.json` / `eslint.config.mjs`.
- Don't bypass `MarkdownRenderer` or `sanitizeUserInput` when handling user/AI-generated content.
- Don't mutate the proxy matcher without also updating `PRIVATE_ROUTES` / `AUTH_PAGES`.
- Don't introduce new `handle*` names outside components, or `fetch*` in the DB layer.

## Key Files Cheat-Sheet

| Purpose | File |
|---------|------|
| Server action: AI streaming | `src/lib/recipe-generation.server.ts` |
| AI system prompt | `src/lib/prompts.ts` |
| Recipe business logic | `src/lib/services/recipe-service.ts` |
| Recipe Firestore ops | `src/lib/db/recipes.ts` |
| Profile Firestore ops | `src/lib/db/profiles.ts` |
| Recipe schemas | `src/lib/schemas/recipe.ts` |
| Serializable auth user | `src/lib/schemas/auth.ts` |
| Firebase init | `src/lib/firebase.ts` |
| Auth listener (root layout) | `src/components/AuthListener.tsx` |
| Unified auth form | `src/components/auth/AuthForm.tsx` |
| Generation orchestration hook | `src/hooks/useRecipeGeneration.ts` |
| Generic Firestore query hook | `src/hooks/useFirestoreQuery.ts` |
| Route protection | `src/proxy.ts` + `src/lib/constants/auth.ts` |
| Firestore rules | `firestore.rules` |
| Storage rules | `storage.rules` |

## Testing

No test setup currently exists (no Jest/Vitest/Playwright config). When introducing tests, the natural boundaries are:
- Unit: `lib/services/**`, `lib/utils/**`, `lib/schemas/**`, selectors in stores.
- Hook-level: `useRecipeGeneration`, `useFirestoreQuery`, `useRecipeSave` with mocked services.
- E2E: auth flow, recipe generation + save, protected-route redirects.
