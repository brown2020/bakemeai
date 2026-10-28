# Bake.me

AI-powered recipe generator: describe a dish or list pantry ingredients, stream a structured personalized recipe, and save favorites to your library. Live site: [https://bake.me](https://bake.me)

## Features

- **AI recipe generation** — streaming structured recipes via the Vercel AI SDK and OpenAI (`gpt-4o`), validated with Zod
- **Cancel** — stop a generation that is waiting to start or already streaming
- **Two modes** — generate from a specific dish or from ingredients on hand
- **Dietary preferences** — diet, allergies, dislikes, cuisines, experience level, and serving size, included in the prompt
- **Email verification** — generation requires a verified email address
- **Rate limit** — 8 generations / 60 seconds per user, stored in Firestore, with an in-memory fallback if that store is unavailable
- **Saved recipes** — private Firestore library with search, difficulty and cuisine filters, detail, and delete
- **Refine** — tweak and regenerate a result; open a saved recipe in `/generate` as an editable variation
- **Servings** — scale a generated or saved recipe (1–12) and save a scaled copy
- **Nutrition** — calories and macros on generate and saved detail
- **Print and copy** — print layout and copy the recipe as markdown
- **Session history** — the last few complete generations stay on `/generate` until sign-out
- **Auth** — email/password and Google (Firebase Auth), plus password reset. The session cookie is HttpOnly and lasts at most one hour
- **Static pages** — about, privacy, terms, support

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, Server Actions) |
| UI | React 19, Tailwind CSS 4, Lucide, CVA, clsx |
| Language | TypeScript 6 |
| AI | Vercel AI SDK 7 (`ai`), `@ai-sdk/openai` 4, `@ai-sdk/rsc` 3, Zod 4 |
| Backend | Firebase 12 client SDK (Auth, Firestore, Storage init only) |
| State | Zustand 5 |
| Tests | Vitest 5, Vite 8 |
| Lint | ESLint 10 |
| Node (CI) | 22 |

`.npmrc` sets `legacy-peer-deps=true`. Package manager is npm.

## Project structure

```
bakemeai/
├── src/
│   ├── app/                 # Pages: /, generate, saved, profile, auth, legal
│   ├── components/          # Shared UI, auth, recipe helpers
│   ├── hooks/               # Generation, save, profile, Firestore queries
│   └── lib/
│       ├── recipe-generation.server.ts  # "use server" OpenAI generation
│       ├── db/              # Firestore profile + recipe access
│       ├── store/           # Zustand stores
│       ├── schemas/         # Zod schemas
│       ├── services/        # Recipe service
│       └── utils/
├── .env.example
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
└── .github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22 (22.12 or newer for the test runner)
- npm
- A Firebase project with Auth and Firestore
- An OpenAI API key

### Install

```bash
git clone https://github.com/brown2020/bakemeai.git
cd bakemeai
git checkout dev
npm install
cp .env.example .env.local
npm run dev
```

Fill in `.env.local` from `.env.example`. Never commit secret values.

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Names only. Values come from Firebase Console and the OpenAI dashboard.

| Name | Purpose |
|------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web SDK |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID. Also used by the durable generation quota |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web app ID |
| `OPENAI_API_KEY` | Server-side recipe generation |
| `NEXT_PUBLIC_ENABLE_CONSOLE_LOGS` | Optional. Set to `true` for structured client logs |

Enable Email/Password and Google in Firebase Auth and authorize the app domains.

There is no `STRIPE_WEBHOOK_SECRET` or other billing variable. The app does not charge users.

## Firebase

- Client config: `src/lib/firebase.ts`
- Rules and index in-repo: `firestore.rules`, `firestore.indexes.json`, `storage.rules`, wired by `firebase.json`
- The composite index is `recipes` by `userId` ascending and `createdAt` descending
- A code push does not deploy rules. Deploy with the Firebase CLI only when those files change

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest, single run |

## Testing and CI

Vitest covers pure utilities (auth, quota, recipes, redirects, rules invariants) and the generation deny/guard paths. It does not drive a browser.

GitHub Actions (`.github/workflows/ci.yml`) on `dev`, `main`, and pull requests: `npm ci`, lint, test, build. The workflow needs the six `NEXT_PUBLIC_FIREBASE_*` secrets. `OPENAI_API_KEY` is required to generate recipes at runtime, not for that CI build.

## Deployment

Deploy the Next.js app (for example on Vercel) and set the environment variable names above in the host. Keep the host on Node 22. Firestore rules, the composite index, and Storage rules are deployed separately.

## Contributing

- `main` — production
- `dev` — integration

See [AGENTS.md](./AGENTS.md), [spec.md](./spec.md), and [roadmap.md](./roadmap.md).

## License

[GNU Affero General Public License v3](./LICENSE.md) (AGPL-3.0).
