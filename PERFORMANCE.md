# Runtime budget (Bake.me)

Stated before measurement for app-eval leanness.runtime_economy.

| Critical path | Artifact | Budget | Conditions |
| --- | --- | --- | --- |
| generate_recipe | Sum of `.next/static/**/*.js` after `npm run build` | ≤ 2.5 MiB | Linux; Next.js 16 production build (Turbopack); includes shared Firebase/AI client chunks |

Acceptance: measured total production static JS ≤ 2.5 MiB.
