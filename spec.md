# Bake.me — Product Specification

What the app does today. Setup lives in [`README.md`](README.md). Agent conventions live in [`AGENTS.md`](AGENTS.md). Next work lives in [`roadmap.md`](roadmap.md).

**Last reviewed**: 2026-10-28

## Product

Bake.me turns a dish idea or a list of ingredients into a structured recipe that respects the cook's diet, allergies, dislikes, cuisines, experience, and serving size. Signed-in cooks can save recipes to a private library.

There is no public feed, meal planner, shopping list, or billing.

## Stack as built

| Layer | Choice |
|-------|--------|
| App | Next.js 16 App Router. One server action, `generateRecipe`. No REST API routes |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript 6 |
| AI | Vercel AI SDK 7, `@ai-sdk/openai`, model `gpt-4o`, Zod 4 |
| Data | Firebase 12 client SDK. Firestore collections `recipes`, `userProfiles`, `generationRateLimits` |
| Auth | Firebase Auth (email/password and Google) plus an HttpOnly session cookie |
| Tests | Vitest 5 on Node. CI is GitHub Actions: lint, test, build |

## Shipped features

| Feature | Behavior |
|---------|----------|
| Landing and legal pages | `/`, `/about`, `/privacy`, `/terms`, `/support` |
| Email/password and Google sign-in | Remember-me. Signup sends a verification email and stays on the page so the notice is visible |
| Password reset | `/reset-password`. `auth/user-not-found` is shown as success so the form does not reveal whether the address is registered |
| Profile | `/profile` stores diet, allergies, dislikes, cuisines, experience, and default servings. Tag fields keep saved chips while a new tag is typed |
| Onboarding | Banner on `/generate` until a profile document exists. Skip is stored per user in localStorage |
| Generate | `/generate`. Modes: specific dish or ingredients. Structured JSON streams into the page |
| Cancel | While a generation is pending or streaming, Cancel drops the debounced start and aborts that server instance's OpenAI stream |
| Regenerate | Optional tweak on the result. A saved recipe can prefill `/generate` |
| History | Last 5 complete generations stay in memory on `/generate` |
| Servings | Scale 1–12 on generate and on a saved recipe that has structured fields. A scaled copy can be saved |
| Nutrition | Calories and macros when the model provides them. Legacy saved markdown is parsed on read |
| Save | Complete recipes only. Servings are stored as an integer from 1 to 100 |
| Library | Search, difficulty and cuisine filters, detail, optimistic delete |
| Print and copy | Print stylesheet and markdown copy on generate and saved detail |
| Route gate | Private routes redirect to login only when the auth cookie is missing. An expired cookie is left so the client can refresh it |
| Generation auth | The server action verifies the ID token with Identity Toolkit and requires `emailVerified` before OpenAI |
| Quota | 8 requests / 60 seconds per user in `generationRateLimits/{uid}`. Memory fallback if the project id is unset or the rules cannot be written |
| Security headers | CSP, `nosniff`, referrer policy, and frame denial |
| Rules | Default-deny Firestore and Storage rules. Recipe lists are capped by count. Storage uploads must be images under 5 MB. Owner delete stays allowed |

## Main flows

**Sign up.** Create an email account or use Google. Email signup shows the verification notice instead of leaving the page. Generation is refused until the email is verified. Google accounts are already verified.

**First recipe.** Choose a mode, describe the dish or list ingredients, and watch the recipe stream. Cancel stops it. A complete result can be saved. A missing profile shows a skippable onboarding banner.

**Return visit.** Firebase restores the user. The HttpOnly cookie is rewritten from the ID token and lasts at most one hour. Saved recipes load with `userId` plus `createdAt` descending.

**Sign out.** The HttpOnly cookie and legacy client cookies are cleared, recipe inputs reset, and the browser navigates to `/login`.

## Data and limits

- Recipe writes allow a fixed set of fields. `createdAt` must be a timestamp. Ingredient and instruction lists hold at most 100 items. Tips hold at most 50.
- The app rejects an ingredient over 1000 characters, an instruction over 5000, or a tip over 2000 before saving. Profile tags are capped at 200 characters. Firestore rules do not re-check each list item, because unrolling every index does not compile.
- Profile `updatedAt` must be a timestamp. List counts match the generation profile schema.
- Quota documents store `count` and `windowStart` only. Clients cannot delete them or reset the window early.
- The saved-recipe query needs the composite index in `firestore.indexes.json`.

## Security boundaries

- The proxy checks cookie presence and expiry only. It does not verify the signature and does not publish a user id header.
- Firestore rules are the data boundary. A user can read and write only their own recipes, profile, and quota document.
- Expected generation failures return `{ ok: false, message, code }` so production does not hide the message.
- Post-auth `?redirect=` values must pass `getSafeRedirectPath`.
- Recipe markdown is rendered by `react-markdown` without raw HTML.

## Known limits of the current build

- Cancel aborts the OpenAI stream only on the server instance that started it.
- Sign-in still has a distinct message for `auth/user-not-found`.
- Saved recipes that lack structured fields can be listed, but serving controls and some filters do not apply.
- Storage rules exist. There is no upload UI.
- There is no end-user billing.
- Tests do not cover the browser. CI does not call OpenAI.
