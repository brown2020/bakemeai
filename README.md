# Bake.me 🧑‍🍳

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
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

### Core Framework

| Package                                       | Version | Purpose                               |
| --------------------------------------------- | ------- | ------------------------------------- |
| [Next.js](https://nextjs.org/)                | 16.0.0  | React framework with App Router & RSC |
| [React](https://react.dev/)                   | 19.1.1  | UI library with Server Components     |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.2   | Type safety                           |

### AI & Data

| Package                                                                   | Version | Purpose                              |
| ------------------------------------------------------------------------- | ------- | ------------------------------------ |
| [Vercel AI SDK](https://sdk.vercel.ai/)                                   | 6.0.3   | AI streaming & structured generation |
| [@ai-sdk/openai](https://sdk.vercel.ai/providers/ai-sdk-providers/openai) | 3.0.1   | OpenAI provider for GPT models       |
| [@ai-sdk/rsc](https://sdk.vercel.ai/docs/ai-sdk-rsc)                      | 2.0.3   | React Server Components integration  |
| [Zod](https://zod.dev/)                                                   | 4.1.12  | Schema validation for AI responses   |

### Backend Services

| Package                                             | Version | Purpose                      |
| --------------------------------------------------- | ------- | ---------------------------- |
| [Firebase](https://firebase.google.com/)            | 12.1    | Auth, Firestore database     |
| [js-cookie](https://github.com/js-cookie/js-cookie) | 3.0.5   | Auth token cookie management |

### UI & Styling

| Package                                                                   | Version | Purpose                      |
| ------------------------------------------------------------------------- | ------- | ---------------------------- |
| [Tailwind CSS](https://tailwindcss.com/)                                  | 4.1.18  | Utility-first CSS            |
| [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | 0.5.19  | Prose styling for recipes    |
| [Lucide React](https://lucide.dev/)                                       | 0.562.0 | Icon library                 |
| [class-variance-authority](https://cva.style/)                            | 0.7.1   | Component variant management |
| [react-markdown](https://github.com/remarkjs/react-markdown)              | 10.1.0  | Markdown rendering           |

### State Management

| Package                                  | Version | Purpose                       |
| ---------------------------------------- | ------- | ----------------------------- |
| [Zustand](https://zustand-demo.pmnd.rs/) | 5.0.8   | Global state with persistence |

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with AuthListener
│   ├── page.tsx                  # Landing page (RSC)
│   ├── generate/                 # Recipe generation
│   │   ├── page.tsx              # Main generate page
│   │   ├── components/           # Feature components
│   │   │   ├── RecipeForm.tsx    # Input form
│   │   │   ├── RecipeDisplay.tsx # Recipe output
│   │   │   └── ModeSelector.tsx  # Generation mode picker
│   │   ├── types.ts              # Feature types
│   │   └── constants.ts          # Prompt templates
│   ├── profile/                  # User preferences
│   ├── saved/                    # Saved recipes library
│   ├── login/                    # Auth (uses shared AuthForm)
│   ├── signup/                   # Auth (uses shared AuthForm)
│   └── reset-password/           # Password recovery
│
├── components/                   # Shared components
│   ├── ui/                       # UI primitives
│   │   ├── Button.tsx            # Button with variants
│   │   ├── Input.tsx             # Input & Textarea
│   │   ├── ChipSelect.tsx        # Multi-select chips
│   │   ├── TagInput.tsx          # Comma-separated tags
│   │   ├── NavLink.tsx           # Active nav link
│   │   ├── ErrorMessage.tsx      # Error alerts
│   │   └── PageSkeleton.tsx      # Loading skeletons
│   ├── auth/                     # Auth components
│   │   ├── AuthForm.tsx          # Unified login/signup
│   │   └── GoogleSignInButton.tsx
│   ├── Navbar.tsx                # Navigation bar
│   ├── PageLayout.tsx            # Page wrapper
│   ├── MarkdownRenderer.tsx      # Recipe markdown display
│   └── HeroCTA.tsx               # Landing page CTA
│
├── hooks/                        # Custom hooks
│   └── useGoogleAuth.ts          # Google auth logic
│
├── lib/                          # Utilities & config
│   ├── actions.ts                # Server actions (AI calls)
│   ├── db.ts                     # Firestore operations
│   ├── firebase.ts               # Firebase initialization
│   ├── auth-cookie.ts            # Auth cookie helpers
│   ├── constants.ts              # App constants
│   ├── types.ts                  # Shared types
│   └── store/                    # Zustand stores
│       ├── auth-store.ts         # Auth state
│       ├── recipe-store.ts       # Recipe generation state
│       └── user-profile-store.ts # User preferences
│
└── proxy.ts                      # Route protection middleware
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** or **yarn** or **pnpm**
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
| `npm run lint`  | Run ESLint                               |

## 🏗️ Architecture

### State Management

Uses **Zustand** for global state with three focused stores:

- **`auth-store`** — User authentication state
- **`recipe-store`** — Recipe generation, input persistence, saving
- **`user-profile-store`** — User preferences and dietary settings

Recipe inputs are persisted to localStorage to prevent data loss on refresh.

### AI Integration

Leverages the **Vercel AI SDK** with `streamObject` for type-safe structured generation:

```typescript
const result = streamObject({
  model: openai("gpt-4o"),
  schema: recipeSchema, // Zod schema
  system: systemPrompt,
  prompt: userPrompt,
  temperature: 0, // Deterministic output
});
```

Recipes stream in real-time as structured JSON, validated against a Zod schema.

### Route Protection

The `proxy.ts` middleware protects authenticated routes (`/generate`, `/profile`, `/saved`) by checking for a valid Firebase auth cookie.

### Firebase Security Rules

This repo includes **default-deny** Firebase rules with per-user ownership checks:

- **Firestore** (`firestore.rules`):
  - **Default**: deny all reads/writes.
  - **`recipes/{recipeId}`**: users can read/update/delete only if `resource.data.userId === request.auth.uid`.
  - **Create recipe**: allowed only when signed in and `request.resource.data.userId === request.auth.uid`.
  - **`userProfiles/{userId}`**: document id is the UID; signed-in users can read/create/update/delete only their own doc.

- **Storage** (`storage.rules`):
  - **Default**: deny all reads/writes.
  - **`users/{userId}/**`**: signed-in users can read/write only within their own folder.

### Component Architecture

- **UI Primitives** (`components/ui/`) — Reusable, unstyled building blocks
- **Feature Components** — Co-located with their routes
- **Shared Components** — Cross-cutting concerns (Navbar, PageLayout)

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
- Adding recipe print view
- Writing unit tests
- Improving accessibility (a11y)

## 🗺️ Roadmap

### In Progress

- [ ] Recipe difficulty ratings
- [ ] Ingredient substitution suggestions
- [ ] Unit conversion (metric/imperial)

### Planned

- [ ] Meal planning calendar
- [ ] Shopping list generation
- [ ] Recipe scaling
- [ ] Nutritional information
- [ ] Recipe sharing
- [ ] Mobile app (React Native)

### Future

- [ ] Voice-guided cooking
- [ ] Smart kitchen device integration
- [ ] Community recipe sharing
- [ ] AI meal plan optimization

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
