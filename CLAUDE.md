# CLAUDE.md - AI Assistant Guide for BakeMe.ai

## Project Overview

BakeMe.ai is an AI-powered recipe generation web application built with Next.js 16, React 19, Firebase, and Vercel AI SDK. Users can generate personalized recipes based on ingredients they have on hand or specific dishes they want to make, with consideration for their dietary preferences and allergies.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **UI**: React 19, Tailwind CSS 4, lucide-react icons
- **AI**: Vercel AI SDK (@ai-sdk/openai, @ai-sdk/rsc, ai) with OpenAI GPT-4o
- **Backend**: Firebase (Auth, Firestore, Storage)
- **State**: Zustand with localStorage persistence
- **Validation**: Zod 4
- **Language**: TypeScript 5.9

## Quick Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── generate/           # Recipe generation feature
│   ├── saved/              # Saved recipes library
│   ├── profile/            # User preferences
│   ├── login/, signup/     # Auth pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # Reusable UI primitives (Button, Input, ChipSelect, etc.)
│   └── auth/               # Auth components (AuthForm, GoogleSignInButton)
├── hooks/                  # Custom hooks (useRecipeGeneration, useFirestoreQuery)
├── lib/
│   ├── db/                 # Firestore operations (recipes.ts, profiles.ts)
│   ├── services/           # Business logic (recipe-service.ts)
│   ├── store/              # Zustand stores (auth, recipe, user-profile)
│   ├── schemas/            # Zod validation schemas
│   ├── constants/          # App constants (ui.ts, auth.ts, domain.ts)
│   ├── utils/              # Utilities (error-handler, logger, auth)
│   ├── firebase.ts         # Firebase SDK initialization
│   ├── prompts.ts          # AI prompt construction
│   └── recipe-generation.server.ts  # Server action for AI generation
```

## Architecture Patterns

### Data Flow
- **Read**: Firestore → db/ → Service → Hook → Store → Component
- **Write**: Component → Hook → Service → db/ → Firestore (+ Store update)

### Layer Responsibilities
- **Components**: UI rendering, event handlers
- **Hooks**: Orchestration, business logic coordination
- **Services**: Pure business logic, API calls
- **Store**: UI state only (no business logic)
- **Database (db/)**: Firestore CRUD operations
- **Utils**: Pure utility functions

### State Management (Zustand)
- `auth-store`: User auth state
- `recipe-store`: Recipe generation state + localStorage persistence
- `user-profile-store`: User dietary preferences

## Key Files

| File | Purpose |
|------|---------|
| `lib/recipe-generation.server.ts` | Server action for AI recipe streaming |
| `lib/services/recipe-service.ts` | generateRecipeWithStreaming, saveRecipeToDatabase, deleteRecipeFromDatabase |
| `lib/prompts.ts` | AI system prompt construction |
| `lib/schemas/recipe.ts` | Recipe Zod schemas |
| `lib/schemas/auth.ts` | SerializableAuthUser type and converter |
| `lib/db/recipes.ts` | Recipe Firestore operations |
| `hooks/useRecipeGeneration.ts` | Recipe generation orchestration with AbortController |
| `hooks/useFirestoreQuery.ts` | Generic Firestore query with version tracking |
| `components/auth/AuthListener.tsx` | Auth state sync (root layout) |

## Naming Conventions

- **Database**: `get*`, `save*`, `delete*` (getUserRecipes, saveRecipe)
- **Hooks**: `use*` returning objects with named properties
- **Services**: verb + noun (generateRecipeWithStreaming)
- **Utils**: `get*`, `convert*`, `is*`, `handle*` (handle* for components only)
- **Types**: `type` for unions/primitives, `interface` for object shapes

## Error Handling

```
Service (throw AppError) → Hook (catch, log, update store) → Component (display)
```

- Use `AppError` class from `lib/utils/error-handler.ts`
- Map errors to user messages via `ERROR_MESSAGES`
- Log with `logger.ts` (logError, logWarning, logInfo)

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
OPENAI_API_KEY=
```

## Code Style Guidelines

- Prefer editing existing files over creating new ones
- Use Server Components by default, "use client" only when needed
- Export page components as default, everything else as named exports
- Keep hooks focused on orchestration, services for business logic
- No business logic in Zustand stores
- JSDoc comments for all exported functions
- Import order: external → Next.js → @/* absolute → relative → types

## Race Condition Prevention

The codebase uses several patterns to prevent race conditions:

- **AbortController** in `useRecipeGeneration` - Cancels in-flight generation when new one starts
- **Version tracking** in `useFirestoreQuery` - Prevents stale responses from overwriting fresh data
- **Ref guards** in `useRecipeSave` - Prevents duplicate saves via `savingRef.current` check
- **Optimistic rollback** in saved page - Stores deleted item for recovery if both delete and refetch fail

## Anti-Patterns to Avoid

- Don't put business logic in components or stores
- Don't use `useEffect` for data fetching (use hooks/services)
- Don't mix concerns between layers
- Don't create new files when editing existing ones suffices
- Don't over-engineer - keep solutions simple and focused
- Don't store Firebase User directly - use SerializableAuthUser for SSR safety
- Don't suppress errors globally - handle them in try/catch at the appropriate layer

## Firestore Collections

- `recipes`: User recipes (userId, title, content, ingredients, etc.)
- `userProfiles`: User preferences (dietary restrictions, allergies, cuisines)

## Testing

No test setup currently exists. When adding tests, consider:
- Unit tests for services and hooks
- Integration tests for auth flow
- E2E tests for recipe generation workflow
