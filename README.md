# Bake.me 🧑‍🍳

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: AGPL--3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE.md)

**Bake.me** is an AI-powered recipe generator that creates personalized recipes based on your ingredients, dietary preferences, and cooking experience. Built with Next.js 16, React 19, and the Vercel AI SDK for streaming structured responses.

![Bake.me Screenshot](/public/screenshot.png)

## ✨ Features

- **🤖 AI Recipe Generation** — Get personalized recipes based on ingredients you have or dishes you want to make
- **📊 Structured Output** — Recipes are generated as typed JSON with Zod schema validation
- **🥗 Dietary Preferences** — Support for vegetarian, vegan, keto, gluten-free, and more
- **⚡ Real-time Streaming** — Watch recipes generate in real-time with partial updates
- **💾 Save Favorites** — Build your personal collection of favorite recipes
- **👤 User Profiles** — Set cooking experience, allergies, preferred cuisines, and serving sizes
- **🔐 Authentication** — Email/password and Google sign-in via Firebase Auth

## 🛠️ Tech Stack

> Exact pinned versions live in [`package.json`](package.json) (the source of truth). This table lists the major versions and what each library does.

| Layer | Libraries (major) | Purpose |
| ----- | ----------------- | ------- |
| Framework | [Next.js](https://nextjs.org/) 16 (App Router, RSC, Turbopack), [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/) 6 | React framework + Server Components, type safety |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) 6, `@ai-sdk/openai` 3, `@ai-sdk/rsc` 2, [Zod](https://zod.dev/) 4 | Streaming structured generation (`gpt-4o`) + schema validation |
| Backend | [Firebase](https://firebase.google.com/) 12, [js-cookie](https://github.com/js-cookie/js-cookie) 3 | Auth, Firestore, auth-cookie management |
| UI | [Tailwind CSS](https://tailwindcss.com/) 4, `@tailwindcss/typography`, [Lucide React](https://lucide.dev/), [class-variance-authority](https://cva.style/), [react-markdown](https://github.com/remarkjs/react-markdown) | Styling, icons, variants, recipe markdown |
| State | [Zustand](https://zustand-demo.pmnd.rs/) 5 | Global state (persists recipe inputs only) |
| Tests | [Vitest](https://vitest.dev/) 3 | Unit tests for pure utilities |

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (AuthListener, Navbar, Footer, ErrorBoundary)
│   ├── page.tsx                  # Landing page (RSC; HeroCTA is client)
│   ├── generate/                 # Recipe generation (mode → form → stream → save)
│   │   └── components/           # RecipeForm, RecipeDisplay, ModeSelector, FormInput, ErrorMessage
│   ├── profile/                  # Cooking preferences
│   ├── saved/                    # Saved recipes library
│   │   └── components/           # RecipeList, RecipeDetail, RecipeSearch, EmptyState, LoadingSkeleton
│   ├── login/ · signup/ · reset-password/   # Auth (shared AuthForm)
│   └── about/ · privacy/ · terms/ · support/ # Static pages
│
├── components/                   # Shared components
│   ├── ui/                       # Primitives (Input, ChipSelect, TagInput, NumberInput, NavLink, …)
│   ├── auth/                     # AuthForm, AuthFormWithRedirect, GoogleSignInButton
│   ├── Navbar.tsx · Footer.tsx · PageLayout.tsx · MarkdownRenderer.tsx · HeroCTA.tsx
│   ├── NutritionSummaryPanel.tsx · PrintRecipeButton.tsx · ProfileOnboardingBanner.tsx
│   └── AuthListener.tsx · ErrorBoundary.tsx
│
├── hooks/                        # useRecipeGeneration, useRecipeSave, useRecipeServingScale,
│                                 # useUserProfile, useFirestoreQuery, useProfileOnboarding, …
├── lib/
│   ├── recipe-generation.server.ts  # "use server" — OpenAI streaming (auth-gated)
│   ├── prompts.ts                    # System prompt builder
│   ├── services/recipe-service.ts    # Client-side service wrappers
│   ├── db/                           # Firestore CRUD (recipes, profiles)
│   ├── schemas/                      # Zod schemas (recipe, user, auth) + types
│   ├── store/                        # Zustand stores (auth, recipe, user-profile)
│   ├── constants/                    # auth, domain, ui, onboarding
│   ├── utils/                        # errors, logger, jwt, server-auth, markdown, sanitize,
│   │                                 # nutrition, recipe-servings, print-recipe, … (+ *.test.ts)
│   └── firebase.ts
│
└── proxy.ts                      # Edge route protection (JWT expiry only, unsigned)
```

> Full architecture and layer boundaries: [`AGENTS.md`](AGENTS.md).

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.9 or later (required by Next.js 16)
- **npm** — this repo is npm-only (`package-lock.json` + `.npmrc`); do not switch package managers
- **Firebase project** with Auth and Firestore enabled
- **OpenAI API key**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/brown2020/bakemeai.git
   cd bakemeai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Firebase and OpenAI credentials. Get these values from:
   - **Firebase**: [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → Your apps
   - **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

4. **Set up Firebase**

   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable **Authentication** (Email/Password and Google providers)
   - Enable **Cloud Firestore** database
   - Create a Firestore index for the `recipes` collection:
     - Collection: `recipes`
     - Fields: `userId` (Ascending), `createdAt` (Descending)

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Create optimized production build        |
| `npm run start` | Serve production build locally           |
| `npm run lint`         | ESLint                               |
| `npm run test`         | Vitest unit tests (CI-safe)          |

## 🏗️ Architecture

Layered architecture (components → hooks → services → Firestore / server actions), Zustand stores, and route protection are documented in **[`AGENTS.md`](AGENTS.md)**. Product capabilities and roadmap: **[`spec.md`](spec.md)**.

Firebase **default-deny** rules with per-user ownership are in `firestore.rules` and `storage.rules`.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style (Prettier + ESLint)
- Use TypeScript strictly (no `any` types)
- Write meaningful commit messages
- Keep PRs focused and atomic
- Add tests for new features when applicable

### Good First Issues

- Adding more dietary preference options
- Improving mobile responsiveness
- Serving-size adjustment in the saved library (see `spec.md` Milestone 1)
- Legacy nutrition backfill on read (see `spec.md` Milestone 2)
- Expanding unit-test coverage of `lib/utils/`
- Improving accessibility (a11y)

## 🗺️ Roadmap

Product direction, feature inventory, and prioritized milestones live in **[`spec.md`](spec.md)** — the authoritative product document.

Agent and architecture guidance for contributors and autonomous tools: **[`AGENTS.md`](AGENTS.md)**.

## 📝 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see [`LICENSE.md`](LICENSE.md) for details.

## 📧 Contact

- **Project**: [github.com/brown2020/bakemeai](https://github.com/brown2020/bakemeai)
- **Email**: info@ignitechannel.com
- **Website**: [ignitechannel.com](https://ignitechannel.com)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) — AI capabilities
- [Vercel](https://vercel.com) — AI SDK & hosting
- [Firebase](https://firebase.google.com) — Backend services
- [Tailwind CSS](https://tailwindcss.com) — Styling
- All our amazing contributors!

---

<p align="center">
  Made with ❤️ by <a href="https://ignitechannel.com">Ignite Channel</a>
</p>
