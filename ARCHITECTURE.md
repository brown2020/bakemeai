# Architecture Overview

This document explains the architectural patterns and design decisions in the BakeMe.ai codebase.

## Application Layers

### 1. UI Components (`/src/app`, `/src/components`)
- **Responsibility**: Render UI, handle user interactions
- **Pattern**: React Server Components by default, Client Components only when needed
- **Data Flow**: Read from stores via hooks, trigger actions via event handlers

### 2. Custom Hooks (`/src/hooks`)
- **Responsibility**: Orchestration and business logic
- **Pattern**: Coordinate between services, stores, and UI components
- **Role**: "Glue layer" that composes operations into user-facing features

**Key Insight**: Hooks orchestrate, stores hold state, services execute logic.

**Example Flow**:
```typescript
// Hook orchestrates the flow
function useRecipeGeneration() {
  const { setStructuredRecipe, setGenerating } = useRecipeStore(); // Get setters
  
  const handleGenerate = async () => {
    setGenerating(true);
    await generateRecipeWithStreaming(...); // Call service
    setStructuredRecipe(result); // Update store
    setGenerating(false);
  };
  
  return { handleGenerate };
}
```

### 3. Stores (`/src/lib/store`)
- **Responsibility**: Pure UI state management
- **Pattern**: Zustand stores with persistence middleware
- **Rules**:
  - NO business logic in stores (that goes in hooks or services)
  - NO orchestration (that goes in hooks)
  - ONLY state setters and getters
  - Computed values via selectors (derived state)

**What Goes in Stores**:
- UI state (loading, errors, form inputs)
- Cached data (recipes, user profile)
- Persisted preferences (mode, last search)

**What Does NOT Go in Stores**:
- API calls (those go in services)
- Validation logic (those go in hooks)
- Business rules (those go in services)

### 4. Services (`/src/lib/services`)
- **Responsibility**: Pure business logic and external operations
- **Pattern**: Stateless functions that perform operations
- **Examples**:
  - `generateRecipeWithStreaming()` - AI recipe generation
  - `saveRecipeToDatabase()` - Database persistence

### 5. Database Layer (`/src/lib/db.ts`)
- **Responsibility**: Firestore operations (CRUD)
- **Pattern**: Direct Firestore SDK calls with error handling
- **Naming**: `get*`, `save*`, `delete*` prefixes

### 6. Utilities (`/src/lib/utils`)
- **Responsibility**: Pure functions with no side effects
- **Examples**: Validation, formatting, parsing, logging

## Data Flow

### Read Flow (Display Data)
```
Database → Service → Hook → Store → Component
```

### Write Flow (User Action)
```
Component → Hook → Service → Database
           ↓
         Store (update local state)
```

### Example: Recipe Generation
```
1. User clicks "Generate" button (Component)
2. Component calls handleGenerate() from hook
3. Hook validates input and calls service
4. Service calls AI API and returns structured data
5. Hook updates store with result
6. Store triggers re-render
7. Component displays recipe
```

## Code Style Conventions

### Import Ordering

**Standard**: Organize imports in a consistent order for readability and minimal git diffs.

**Order**:
1. External packages (react, next, firebase, etc.)
2. Next.js framework imports (next/*, @next/*)
3. Absolute imports from project (@/*)
4. Relative imports (./, ../)
5. Type-only imports (grouped with their category)

**Example**:
```typescript
// 1. External packages
import { useState, useCallback } from "react";
import { z } from "zod";

// 2. Next.js framework
import { useRouter } from "next/navigation";
import Image from "next/image";

// 3. Absolute imports
import { useAuthStore } from "@/lib/store/auth-store";
import { saveRecipe } from "@/lib/db";
import type { Recipe } from "@/lib/schemas/recipe";

// 4. Relative imports
import { RecipeCard } from "./RecipeCard";
import type { Props } from "./types";
```

**Rationale**: Consistent ordering reduces cognitive load when scanning imports and minimizes merge conflicts.

### JSDoc Documentation

**Standard**: All exported functions must have JSDoc comments with parameter descriptions and return values.

**Required elements**:
- One-line description of what the function does
- `@param` tags for all parameters with type and description
- `@returns` tag describing the return value
- `@throws` tag if the function can throw errors
- `@example` (optional but encouraged) showing common usage

**Example**:
```typescript
/**
 * Saves a recipe to the database.
 * Validates recipe completeness before saving.
 * 
 * @param userId - The user's unique identifier
 * @param structuredRecipe - Recipe data to save
 * @returns Promise that resolves when save completes
 * @throws AppError if recipe validation fails or save operation fails
 * 
 * @example
 * await saveRecipeToDatabase("user123", recipe);
 */
export async function saveRecipeToDatabase(
  userId: string,
  structuredRecipe: RecipeStructure
): Promise<void> {
  // ...
}
```

**Rationale**: JSDoc provides inline documentation for IDE intellisense and serves as API documentation for function consumers.

### Comment Style

**Standard**: Use different comment styles for different purposes to improve code readability.

**JSDoc comments (`/** */`)**: For exported functions, classes, and types
```typescript
/**
 * Saves a recipe to the database.
 * @param userId - The user's unique identifier
 * @returns Promise that resolves when save completes
 */
export function saveRecipe(userId: string): Promise<void> {
  // ...
}
```

**Single-line comments (`//`)**: For inline explanations and brief clarifications
```typescript
// Guard: Check if user is authenticated before proceeding
if (!user) return;

// Optimistic update: remove from UI immediately
setRecipes(recipes.filter(r => r.id !== id));
```

**Multi-line comments (`/* */`)**: For internal implementation notes and explanations
```typescript
/*
 * Race condition handling strategy:
 * 1. Increment version on each auth event
 * 2. Cancel pending operations via AbortController
 * 3. Double-check version before state updates
 */
```

**Section separators**: Use banner comments for major file sections
```typescript
// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
```

**Rationale**: Consistent comment styles make it easier to distinguish between API documentation, inline explanations, and implementation notes.

### Error Handling

**Standard**: Consistent error handling strategy across all layers.

**Pattern**:
1. **Services throw AppError** - Business logic layer throws typed errors
2. **Hooks catch and log** - Orchestration layer catches, logs, and converts to user messages
3. **Components display** - UI layer displays error messages to users

**Service layer** (db/, services/):
```typescript
// GOOD: Throw AppError with user-friendly message
export async function saveRecipe(params: SaveRecipeParams): Promise<Recipe> {
  try {
    // ... operation
  } catch (error) {
    logError("Failed to save recipe", error, { userId });
    throw new AppError("Unable to save recipe. Please try again.", "RECIPE_SAVE_FAILED");
  }
}
```

**Hook layer** (hooks/):
```typescript
// GOOD: Catch, log, convert to user message, update state
export function useRecipeSave() {
  const saveRecipe = async (userId: string) => {
    try {
      await saveRecipeToDatabase(userId, recipe);
    } catch (error) {
      const message = convertErrorToMessage(error, ERROR_MESSAGES.RECIPE.SAVE_FAILED);
      setSaveError(message);
    }
  };
}
```

**Component layer** (components/, app/):
```typescript
// GOOD: Display error from state
{saveError && <ErrorMessage message={saveError} />}
```

**Anti-pattern**: Mixing responsibilities
```typescript
// BAD: Component catching and logging
const Component = () => {
  try {
    await saveRecipe();
  } catch (error) {
    logError("Save failed", error); // Logging should be in service
    setError("Failed"); // Non-user-friendly message
  }
};
```

**Rationale**: Clear separation ensures errors are logged once (in services), converted once (in hooks), and displayed consistently (in components).

### Export Conventions

**Standard**: Use default exports for page components, named exports for reusable components and utilities.

**Default exports** (pages, route handlers):
```typescript
// app/profile/page.tsx
export default function Profile() {
  return <div>Profile Page</div>;
}

// app/api/recipes/route.ts
export async function GET() {
  return Response.json({ recipes: [] });
}
```

**Named exports** (reusable components, utilities, services):
```typescript
// components/RecipeCard.tsx
export function RecipeCard({ recipe }: Props) {
  return <div>{recipe.title}</div>;
}

// lib/db/recipes.ts
export async function saveRecipe(params: SaveRecipeParams): Promise<Recipe> {
  // ...
}
```

**Rationale**:
- Next.js requires default exports for page components and route handlers
- Named exports make refactoring easier (rename refactoring works)
- Named exports prevent import name mismatches
- Named exports allow multiple exports from single file

### Naming Conventions

**Standard**: Consistent function naming across the codebase based on purpose.

**Database operations** (lib/db/):
- `get*` - Read operations (getUserRecipes, getUserProfile)
- `save*` - Create or update operations (saveRecipe, saveUserProfile)
- `delete*` - Deletion operations (deleteRecipe)

**Service layer** (lib/services/):
- Descriptive verb + noun (generateRecipeWithStreaming, saveRecipeToDatabase)
- Use full names, avoid abbreviations

**Hooks** (hooks/):
- `use*` - All custom hooks (useRecipeGeneration, useDebounce)
- Return objects with descriptive property names, not positional arrays

**Utilities** (lib/utils/):
- `get*` - Retrieve or compute values (getFirestoreErrorMessage, getSafeRedirectPath)
- `convert*` - Transform data (convertToMarkdown, convertErrorToMessage)
- `is*` - Boolean checks (isSafeRedirectPath)
- Action verbs for operations (sanitizeMarkdown, formatRecipeBodyAsMarkdown)

**Reserved prefixes**:
- `fetch*` - Reserved for client-side data fetching (avoid in services/db)
- `handle*` - Reserved for event handlers in components
- `on*` - Reserved for callback props

**Example audit**:
```typescript
// GOOD: Clear, follows convention
export async function getUserRecipes(userId: string): Promise<Recipe[]>
export function useRecipeGeneration(): UseRecipeGenerationReturn
export function convertToMarkdown(recipe: RecipeStructure): string

// BAD: Inconsistent or unclear
export async function fetchUserRecipes() // Use get* in db layer
export function recipeGeneration() // Missing use prefix for hook
export function toMarkdown() // Missing convert prefix
```

### Type vs Interface

**Standard**: Use `type` for primitives/unions/Zod infers, `interface` for object shapes that describe data structures or component props.

**Use `type` for**:
- Union types: `type RecipeMode = "specific" | "ingredients"`
- Primitive aliases: `type UserId = string`
- Zod schema infers: `type Recipe = z.infer<typeof recipeSchema>`
- Intersection types: `type Props = BaseProps & { extra: string }`
- Mapped types: `type Readonly<T> = { readonly [P in keyof T]: T[P] }`

**Use `interface` for**:
- Object shapes: `interface UserProfile { name: string; email: string }`
- Component props: `interface ButtonProps { label: string; onClick: () => void }`
- Store state: `interface RecipeState { recipes: Recipe[]; isLoading: boolean }`
- API contracts: `interface ApiResponse { data: T; error?: string }`

**Rationale**:
- `type` is more flexible for complex type operations (unions, intersections, mapped types)
- `interface` is clearer for object shapes and can be extended via declaration merging
- `interface` provides better IDE autocomplete and error messages for object properties
- Consistency: Zod uses types, so inferred schemas should too

**Example**:
```typescript
// GOOD
export type RecipeMode = "specific" | "ingredients"; // Union type
export type Recipe = z.infer<typeof recipeSchema>; // Zod infer
export interface RecipeCardProps { // Object shape for props
  recipe: Recipe;
  onSelect: () => void;
}

// AVOID
export interface RecipeMode { // Can't use interface for union
  // ...
}
export type RecipeCardProps = { // Less clear for component props
  recipe: Recipe;
  onSelect: () => void;
}
```

### Type File Organization

**Standard**: Only create dedicated type files when they serve multiple components or provide shared domain types.

**Create a types.ts file when**:
- Multiple components in a directory share the same prop types
- The types are specific to that feature/page (not globally used)
- There are 3+ type definitions for the same domain

**Inline types when**:
- The type is only used in a single component
- The type is simple (1-2 properties)
- It's a callback or event handler type

**Use schema files when**:
- Types are derived from Zod schemas (keep types near schemas)
- Types represent data models (Recipe, UserProfile)
- Types are used across multiple features

**Example structure**:
```
app/generate/
  ├── types.ts              // Shared types for generate feature
  │   ├── FormInputProps    // Used by multiple components
  │   ├── RecipeDisplayProps
  │   └── Mode              // Feature-specific type alias
  ├── components/
  │   ├── FormInput.tsx     // Imports from ../types
  │   └── RecipeDisplay.tsx // Imports from ../types
  └── page.tsx              // Imports from ./types
```

**Anti-pattern**: Creating a types.ts file with a single type export
```typescript
// BAD: types.ts with one export
export type Mode = RecipeMode | null;

// GOOD: Inline the type or move to constants
// In component:
const [mode, setMode] = useState<RecipeMode | null>(null);
```

### Function Declarations

**Standard**: Use `function` keyword for top-level functions, arrow functions for callbacks and inline functions.

**Top-level functions** (exported functions, service functions, utility functions):
```typescript
// GOOD: function declaration
export function saveRecipe(params: SaveRecipeParams): Promise<Recipe> {
  // ...
}

// GOOD: Named function for hooks
export function useRecipeGeneration() {
  // ...
}
```

**Callbacks and inline functions** (event handlers, array methods, inline logic):
```typescript
// GOOD: arrow function for callbacks
const handleSubmit = async (e: FormEvent) => {
  // ...
};

// GOOD: arrow function in array methods
const filtered = recipes.filter((recipe) => recipe.title.includes(search));

// GOOD: arrow function for inline React components
const Button = ({ children }: Props) => <button>{children}</button>;
```

**Rationale**:
- `function` declarations are hoisted, making them available throughout the module
- `function` keyword is more explicit for primary module exports
- Arrow functions bind `this` lexically, making them ideal for callbacks
- Arrow functions are more concise for short inline operations

## Architectural Principles

### Separation of Concerns
- **Components**: Presentation and user interaction
- **Hooks**: Orchestration and coordination
- **Stores**: State management
- **Services**: Business logic
- **Database**: Data persistence

### Single Responsibility Principle
Each layer has ONE clear job. Don't mix:
- UI rendering with business logic
- State management with API calls
- Validation with formatting

### Dependency Direction
```
Components → Hooks → Services/Stores → Database/API
           ↘       ↘       ↘
            Utilities (pure functions)
```

Dependencies flow downward. Lower layers never import from higher layers.

## Common Patterns

### Pattern: Form Submission
```typescript
// Component
function RecipeForm() {
  const { handleGenerate } = useRecipeGeneration();
  
  const onSubmit = async (e) => {
    e.preventDefault();
    await handleGenerate(e);
  };
  
  return <form onSubmit={onSubmit}>...</form>;
}

// Hook (orchestrates)
function useRecipeGeneration() {
  const { setGenerating, setError } = useRecipeStore();
  
  const handleGenerate = async (e) => {
    setGenerating(true);
    try {
      await generateRecipeService(); // Service does the work
    } catch (error) {
      setError(convertErrorToMessage(error, "Failed"));
    } finally {
      setGenerating(false);
    }
  };
  
  return { handleGenerate };
}
```

### Pattern: Data Fetching
```typescript
// Hook
function useUserRecipes(userId) {
  const { data, setData } = useFirestoreQuery({
    queryFn: getUserRecipes, // Database function
    userId,
  });
  
  return { recipes: data };
}
```

### Pattern: Optimistic Updates
```typescript
// Hook
function useRecipeDelete() {
  const { recipes, setRecipes } = useRecipeStore();
  
  const deleteRecipe = async (id) => {
    // Optimistic: update UI immediately
    setRecipes(recipes.filter(r => r.id !== id));
    
    try {
      await deleteRecipeService(id); // Database call
    } catch (error) {
      // Rollback on error
      await refetch();
    }
  };
  
  return { deleteRecipe };
}
```

## Anti-Patterns to Avoid

❌ **Business logic in stores**
```typescript
// BAD: Store shouldn't validate or call APIs
const store = create((set) => ({
  saveRecipe: async (recipe) => {
    if (!recipe.title) return; // Validation in store
    await api.save(recipe); // API call in store
  }
}));
```

✅ **Business logic in hooks/services**
```typescript
// GOOD: Hook orchestrates, service has logic
function useRecipeSave() {
  const { setIsSaving } = useRecipeStore();
  
  const save = async (recipe) => {
    if (!recipe.title) throw new Error("Title required");
    setIsSaving(true);
    await saveRecipeService(recipe); // Service handles API
    setIsSaving(false);
  };
}
```

❌ **Stores calling stores**
```typescript
// BAD: Creates coupling and circular dependencies
const recipeStore = create((set, get) => ({
  save: () => {
    const user = userStore.getState().user; // Cross-store dependency
  }
}));
```

✅ **Hooks compose multiple stores**
```typescript
// GOOD: Hook coordinates between stores
function useRecipeSave() {
  const { user } = useAuthStore();
  const { setRecipe } = useRecipeStore();
  
  // Hook composes data from multiple sources
}
```

## When to Create What

### Create a Hook when:
- You need to coordinate multiple operations
- You need to combine data from multiple stores
- You have business logic that's reused across components
- You're handling async operations with state updates

### Create a Service when:
- You have pure business logic
- You're making API/database calls
- You're transforming data (e.g., formatting, parsing)
- The logic could be tested independently of React

### Create a Store when:
- You need to share state across components
- You need to persist state to localStorage
- You're managing UI state (loading, errors, form values)

### Use a Utility when:
- You have a pure function with no side effects
- The function doesn't depend on React or component lifecycle
- It's a helper for formatting, validation, or conversion
