# Approved Product Improvement Plan

## Approved Feature IDs

- PIP-001
- PIP-002
- PIP-003
- PIP-004
- PIP-005

## User Direction

User approved all five proposed feature IDs with: "do all 5".

## Roadmap Updates

- `spec.md` already contained milestones for PIP-001, PIP-002, and PIP-003.
- Added Milestone 4 for PIP-004, "Refine from saved recipe".
- Added Milestone 5 for PIP-005, "Saved-library metadata filters".

## Implementation Plan

Build and push each approved feature in order:

1. PIP-001 saved-library serving adjustment.
2. PIP-002 session generation history.
3. PIP-003 server-side generation rate limit.
4. PIP-004 refine from saved recipe.
5. PIP-005 saved-library metadata filters.

After each feature, run targeted checks plus lint, commit only in-scope files,
and push `dev` to `origin/dev`.
