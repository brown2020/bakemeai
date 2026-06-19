# Validation

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | Passed | Proposal phase docs only; no code behavior changed. |
| `npx vitest run src/lib/utils/saved-recipe.test.ts src/lib/utils/recipe-servings.test.ts` | Passed | PIP-001 focused utility coverage. |
| `npm run lint` | Passed | PIP-001 feature phase. |
| `npm run build` | Passed | PIP-001 with placeholder Firebase/OpenAI env values. |
| `npx vitest run src/lib/utils/recipe-history.test.ts src/lib/utils/recipe-prompt.test.ts` | Passed | PIP-002 focused utility/prompt coverage. |
| `npm run lint` | Passed | PIP-002 feature phase. |
| `npm run build` | Passed | PIP-002 with placeholder Firebase/OpenAI env values. |

## Targeted Checks

- PIP-001 utility tests passed.
- PIP-002 history utility and prompt tests passed.

## Broader Gates

- PIP-001 lint and production build passed.
- PIP-002 lint and production build passed.

## Baseline Failures

- None observed.
