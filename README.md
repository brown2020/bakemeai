# Bake.me

AI-powered recipe generator: describe a dish or list pantry ingredients, stream a structured personalized recipe, and save favorites to your library. Live site: [https://bake.me](https://bake.me)

## Features

Verified from the current codebase:

- **AI recipe generation** — streaming structured recipes via Vercel AI SDK + OpenAI (`gpt-4o`), validated with Zod
- **Two modes** — generate from a specific dish or from ingredients on hand
- **Dietary preferences** — profile fields for diet, allergies, dislikes, cuisines, experience level, and serving size
- **Saved recipes** — private Firestore library with search, detail view, delete, print/copy/export helpers
- **Auth** — email/password and Google sign-in (Firebase Auth); login, signup, reset-password flows
- **Nutrition summary** — nutrition panel on generated recipes
- **Markdown rendering** — recipe content via `react-markdown` + Tailwind typography
- **Static pages** — about, privacy, terms, support

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router, Server Actions) |
| UI | React 19, Tailwind CSS 4, Lucide, CVA, clsx |
| Language | TypeScript 6 |
| AI | Vercel AI SDK 6, `@ai-sdk/openai`, `@ai-sdk/rsc`, Zod 4 |
| Backend | Firebase 12 (Auth, Firestore, Storage client SDK) |
| State | Zustand 5 |
| Cookies | js-cookie |
| Tests | Vitest 4 |
| Lint | ESLint 10 |
| Node (CI) | 22 |

`.npmrc` sets `legacy-peer-deps=true`.

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
├── storage.rules
└── .github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Firebase project (Auth, Firestore; Storage if using avatar/images)
- OpenAI API key

### Install

```bash
git clone https://github.com/brown2020/bakemeai.git
cd bakemeai
git checkout dev
npm install
cp .env.example .env.local
# fill in values — never commit secrets
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Name | Purpose | Where to get it |
|------|---------|-----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web SDK | Firebase Console → Project settings → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain | Same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | Same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | Same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | Same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web app ID | Same |
| `OPENAI_API_KEY` | Server-side recipe generation | [platform.openai.com](https://platform.openai.com) |
| `NEXT_PUBLIC_ENABLE_CONSOLE_LOGS` | Optional structured client logs (`true`) | Optional |

See `.env.example`. Enable Email/Password and Google providers in Firebase Auth; authorize your domains.

## Firebase

- Client config: `src/lib/firebase.ts`
- Security rules in-repo: `firestore.rules`, `storage.rules` (also mirrored under `docs/`)
- Deploy rules with the Firebase CLI when they change

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Testing and CI

Vitest covers pure utils (nutrition, rate-limit, JWT helpers, recipe library/history, etc.) and schema/generation deny tests.

GitHub Actions (`.github/workflows/ci.yml`) on `dev` / `main` and PRs: `npm ci` → lint → test → build. Required secrets: the six `NEXT_PUBLIC_FIREBASE_*` vars. `OPENAI_API_KEY` is needed at runtime for generation, not for the default CI steps.

## Deployment

Deploy as a Next.js app (e.g. Vercel) to [https://bake.me](https://bake.me). Set the env vars above in the host. Deploy Firestore/Storage rules separately when updated. Remote image hosts allowed in `next.config.ts` include Firebase Storage and Google user-content URLs.

## Contributing

- `main` — production
- `dev` — integration

See [AGENTS.md](./AGENTS.md) and [spec.md](./spec.md). Branch from `dev`.

## License

[GNU Affero General Public License v3](./LICENSE.md) (AGPL-3.0).
