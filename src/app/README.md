# App Directory Conventions

This directory follows Next.js 16 App Router conventions.

## Export Patterns

### Pages (page.tsx, layout.tsx, etc.)
- **MUST use default exports** (Next.js requirement)
- Next.js looks for default exports when loading routes
- Example: `export default function Home() { ... }`

### Components (all other files)
- **MUST use named exports** (codebase standard)
- Improves IDE autocomplete and refactoring
- Makes imports more explicit
- Example: `export function RecipeCard() { ... }`

### Rationale
This split convention is intentional:
- Default exports: Only where Next.js requires them (pages, layouts, errors)
- Named exports: Everywhere else for better developer experience

## Server vs Client Components

### Default: Server Components
- All components are server components by default in Next.js 16
- No `"use client"` directive needed
- Can use async/await, access backend directly

### Client Components: Opt-in with `"use client"`
- Required for: hooks, event handlers, browser APIs, state management
- Place `"use client"` on **line 1** (before imports)
- Keep client components focused and minimal

## File Organization

### Route-specific components
**Pattern**: Create `components/` folder within route directory when route has 3+ components

**Examples**:
- `app/generate/components/` - Has 5 route-specific components
- `app/saved/components/` - Has 5 route-specific components

**When to use**:
- Components are only used by that specific route
- Route has multiple components (3+ components warrants subfolder)
- Keeps route directory organized and navigable

**Single-file routes** (login, signup, profile, reset-password):
- No `components/` subfolder needed
- Page.tsx contains all route logic
- Shared components are imported from `/src/components/`

### Shared components
**Location**: `/src/components/` at root level

**When to use**:
- Component is used by 2+ routes
- Component is part of core UI (Button, Input, etc.)
- Component is reusable infrastructure (ErrorBoundary, etc.)

**Examples**:
- `/src/components/Button.tsx` - Used everywhere
- `/src/components/auth/AuthForm.tsx` - Used by login and signup
- `/src/components/ui/Input.tsx` - Shared form component

### Organization Rules
1. Start with shared components in `/src/components/`
2. Move to route-specific folder only when used by single route
3. Create route `components/` subfolder when route has 3+ components
4. Keep imports shallow (max 2-3 levels deep)
