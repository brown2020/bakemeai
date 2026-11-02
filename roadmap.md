# Bake.me — Roadmap

Punchlist after the 2026-10-28 maintenance pass. The as-built spec is [`spec.md`](spec.md).

GitHub has no open issues or pull requests. Nothing below is scheduled.

## Next

1. **Cancel across instances.** Cancel aborts the OpenAI stream only on the instance that started it. A second instance keeps generating and still counts against the quota.
2. **Billing and abuse analytics.** The 8/60s Firestore cap is the only cost control. There is no per-user budget, alert, or durable audit of generation failures.
3. **Stream duration.** It is not confirmed whether the host's default function duration cuts off a long `streamObject`. Do not add `maxDuration` until a real cutoff is observed.
4. **Sign-in enumeration copy.** Password reset hides `auth/user-not-found`. Sign-in still maps that code to a distinct "no account" message.
5. **List item checks in rules.** Rules cap list length only. A signed-in client that writes Firestore directly can put a non-string or a very long string in their own recipe or profile lists. The app save path rejects those. Tightening rules needs a form the compiler accepts.
6. **Storage UI.** `storage.rules` allows the owner to store images under 5 MB. No screen uploads anything.
7. **Browser tests.** Unit tests cover pure helpers and generation guards. The generate, save, and auth screens are not exercised in CI.

## Known bugs and limits

- Legacy saved recipes without structured fields skip serving controls and some library filters. Nutrition can still be parsed from the markdown.
- Session history is memory only and clears on sign-out or refresh.
- The durable quota falls back to memory when `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is unset or the quota rules reject the write.
- Profile tag length is enforced in the app schema, not in Firestore rules.

## Not in scope

- Meal planning
- Shopping lists
- Public recipe pages or a community
- A native app
- Voice-guided cooking
- Appliance integrations
- A metric/imperial toggle

## Upgrade notes

Adopted on 2026-11-02. `package.json` `engines.node` is `>=24.12.0`. CI (`.github/workflows/ci.yml`) and the Vercel project are already on Node 24.

- **Firebase JS SDK 13.1.0.** Auth, Firestore, and client init are unchanged. The 13.0 breaks are in Firebase AI Logic, which this app does not call.
- **minimatch 11.0.4** override. ESLint 10 and `typescript-eslint` still request minimatch 10.2.6 (`GHSA-g3hv-75wg-m249`). Lint passes on 11. The `@grpc/grpc-js` and `postcss-selector-parser` overrides stay.

Held back on purpose:

- **TypeScript 7.0.2** is latest. `@typescript-eslint/parser` 8.72.1 (latest) peers `typescript >=4.8.4 <6.1.0`, so the app stays on TypeScript 6.0.3.
- **`firebase-admin` is not a dependency.** `require('firebase-admin/auth')` fails with `MODULE_NOT_FOUND`, not `ERR_REQUIRE_ESM`. Do not add a `jwks-rsa` / `jose` override unless that package is added and the require fails that way.

No new environment variables. Do not rotate secrets for this list.
