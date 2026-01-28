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
