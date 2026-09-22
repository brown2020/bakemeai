# Operations

Operational readiness for Bake.me: quality gates, failure drills, monitoring,
rate limits, and rollback. Proportional to a Next.js + Firebase Auth/Firestore
+ OpenAI streaming recipe app with a single AI server action.

## Quality gates

Local (same commands as CI):

```bash
npm run lint
npm test
npm run build
```

GitHub Actions workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
runs `npm ci` → lint → test → build on pushes to `dev`/`main` and on pull requests.
Public Firebase client env names are wired as workflow `env` (no secrets in CI for
the client SDK). `OPENAI_API_KEY` is not required for lint/test/build.

Observed green run on `dev` at `376cad15fe5448613b03da29fa5a4637921c232c`:
https://github.com/brown2020/bakemeai/actions/runs/35694191815 (CI `check`
conclusion `success`, including `src/lib/recovery-integrity.test.ts`).

Local vs CI vs host:

| Concern | Local | CI | Host (Vercel + Firebase) |
| --- | --- | --- | --- |
| Node | developer machine | Actions Node 22 | Vercel Node |
| `NEXT_PUBLIC_FIREBASE_*` | `.env.local` | workflow `env` | Vercel project env |
| `OPENAI_API_KEY` | `.env.local` | absent (build does not call OpenAI) | Vercel secret |
| Auth/data | live Firebase project | none (unit tests mock) | live Firebase project |

## Critical operations and owners

| Operation | Owner | Failure surface |
| --- | --- | --- |
| Recipe generate (stream) | `src/lib/recipe-generation.server.ts` | Auth gate → per-user rate limit → OpenAI `streamObject`; errors become `AppError` (`RECIPE_PROVIDER_ERROR` / `RATE_LIMITED` / `OPENAI_API_KEY_MISSING`) via `logError` |
| Recipe save / delete | `src/lib/db/recipes.ts` + `src/lib/services/recipe-service.ts` | Zod complete-schema gate before write; Firestore errors mapped to user-safe `AppError`; optimistic delete rollback on `saved/page.tsx` |
| Session / route gate | `src/lib/utils/server-auth.ts` + `src/proxy.ts` | Server action verifies cookie via Firebase Identity Toolkit; proxy is expiry-only (not authority) |
| Client crash isolation | `src/components/ErrorBoundary.tsx`, `src/app/global-error.tsx` | Feature + global boundaries; generate/saved wrap major panels |

## Rate limits and resource bounds

- Generation: **8 requests / 60s / userId** in-memory per server instance
  (`RECIPE_GENERATION_RATE_LIMIT` in `recipe-generation.server.ts`).
- Prompt length capped by `MAX_SERVER_PROMPT_LENGTH`.
- UI debounce: `UI_TIMING.AI_GENERATION_DEBOUNCE`; streams cancel via `AbortController`.
- No background jobs/queues; unbounded fan-out is not applicable.

## Failure drills (observed)

Automated evidence: `src/lib/recovery-integrity.test.ts` (also run in CI).

1. **OpenAI/provider start failure** — mock `streamObject` throws; expect
   `RECIPE_PROVIDER_ERROR`; Firestore `saveRecipe` must not be called.
2. **Firestore save failure** — mock save rejects; expect `RECIPE_SAVE_FAILED`
   (`AppError`); no silent success.
3. **Concurrent saves** — one write succeeds, contention rejects the other;
   ownership `userId` preserved; no invented success.
4. **Interrupted / incomplete payload** — incomplete structured recipe rejected
   with `RECIPE_VALIDATION_FAILED` before any write.
5. **Unauthenticated generate** — `src/lib/recipe-generation.deny.test.ts` asserts
   deny before OpenAI (see also AGENTS.md auth gate notes).

Manual smoke (optional after deploy):

```bash
npm run build && npm run start -- -p 3010
# Unauthenticated POST/server-action generate → deny / redirect, no OpenAI spend.
# With bad OPENAI_API_KEY in a staging env → sanitized RECIPE_PROVIDER_ERROR UI.
```

## Monitoring and diagnostics

- Structured logging: `src/lib/utils/logger.ts` (`logError` / `logWarning`).
  Production console JSON when `NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=true`; otherwise
  rely on host runtime logs (Vercel function/runtime logs for the server action).
- User-facing messages stay sanitized via `AppError` + `ERROR_MESSAGES` (no stack
  traces or API keys in UI).
- CI is the primary actionable signal for lint/test/build regressions on `dev`.
- Host health: Vercel deployment status + Firebase console (Auth/Firestore
  usage/errors). No separate APM required at current risk.

## Rollback / restore

1. **App rollback** — in Vercel, promote the previous production deployment, or
   `git revert` the bad commit on `dev` and let the host redeploy.
2. **Data** — Firestore is the source of truth for saved recipes/profiles; client
   Zustand persist holds recipe *inputs* only (never AI output). Restoring an
   older deployment does not require rebuilding a local recipe cache.
3. **Rules** — `firestore.rules` / `storage.rules` deploy via Firebase tooling when
   changed; keep ownership checks (`userId == request.auth.uid`) intact.
4. **Secrets drift** — Vercel project env owns `OPENAI_API_KEY` and
   `NEXT_PUBLIC_FIREBASE_*`; CI embeds only public Firebase client values for build.

## Configuration ownership

| Config | Owner | Drift check |
| --- | --- | --- |
| Public Firebase client | Vercel env + `.env.example` + CI workflow `env` | Names must match `src/lib/firebase.ts` |
| OpenAI key | Vercel secret / local `.env.local` | Never commit; CI build must not require it |
| Quality gate commands | `package.json` scripts + `.github/workflows/ci.yml` | Keep AGENTS “Canonical Validation” in sync |
| Runtime budget | `PERFORMANCE.md` | Re-measure after large dependency or bundle changes |
