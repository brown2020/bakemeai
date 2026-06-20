# Orchestration Plan

## Mode Selection

- Repo: /Users/stephenbrown/Code/OPENSOURCE/bakemeai
- Branch: dev
- Work mode: full codebase-improvement autopilot
- Run folder: /Users/stephenbrown/Code/OPENSOURCE/bakemeai/agent-runs/2026-06-20-codebase-pass
- Verifiable gates: git remote read, dry-run push, npm run lint, npm run test, npm run build, targeted Vitest checks, source search evidence
- Human-decision blockers: product roadmap priorities, broad architecture rewrites, secrets or production service access, non-fast-forward Git state
- Resume policy: re-run low-interruption and GitHub preflight, read run-state.md and task-queue.md, push any validated local phase commit before new edits

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop | lint/test/build outcomes recorded and failures classified | Baseline is clean or reproducible failures are owned |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop, Architecture Fitness Loop, Lean Code Loop | Targeted checks and lint pass for each fix batch | Highest-priority executable fixes are pushed or blocked with evidence |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Safe package/dead-code changes pass lint/test/build | Safe cleanup pushed; risky updates deferred |
| Review | Judge Loop | PASS or bounded follow-up tasks created | Review report pushed |
| Stabilization Loop | Stabilization Loop, Judge Loop, Reflect-or-Kill when needed | Completion criteria pass or blocker recorded | Repo is clean/synced with no P0/P1 or confirmed races |
| Integrator | Final Completion Gate | final checks and sync state recorded | final report pushed |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | 00-orchestration-plan.md, run-state.md, task-queue.md | Startup planning and resume state |
| T-002 | AGENTS.md, README.md, spec.md, 01-preflight-and-repo-docs.md | Evidence-backed repo docs sweep |
| T-003 | 02-baseline-validation.md | Baseline command results and classification |
| T-004 | 03-findings-backlog.md, task-queue.md | Findings backlog and architecture scorecard |
| T-005+ | Source/test files named in task-queue.md | Owned one batch at a time after findings are queued |
