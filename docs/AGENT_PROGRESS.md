# Autonomous Agent Progress

This file is intentionally concise so an agent can resume work efficiently.

## Runtime note (important for resuming)
The Codex sandbox mounts `.git` read-only and the approval policy forbids
escalation, so **the agent cannot run `git commit`**. The GitHub Actions
workflow (`autonomous-agent.yml`, step "Commit and push verified changes")
commits the whole working tree and pushes to `main` at the end of the run.
Therefore:
- keep the working tree coherent and green at all times;
- treat frequent updates to this file as the real checkpoint mechanism;
- never leave half-finished code behind — it will be committed as-is.

## Environment facts discovered
- Node v22.23.2, npm 10.9.8, Python 3.12.3, 4 CPU / 15 GiB RAM, network works.
- npm default cache `/home/guest/.npm` is not writable; a gitignored `.npmrc`
  sets `cache=/tmp/npm-cache`.
- `drizzle-kit` needs a writable XDG dir: export
  `XDG_DATA_HOME=/tmp/xdg XDG_CONFIG_HOME=/tmp/xdg` before running it.
- `better-sqlite3` 11 native module builds/loads fine (SQLite 3.49.2).

## Current status
- Stack decision recorded in `docs/ARCHITECTURE.md`.
- M0 in progress: monorepo tooling, shared types, database layer done.

## Current task
Continue M0/M1: build the Fastify backend with config, Telegram initData
HMAC verification, JWT sessions, health endpoint, and tests.

## Completed
- [x] Autonomous engineering contract
- [x] Product roadmap, definition of done, progress file
- [x] Architecture decision recorded
- [x] M0: npm workspaces monorepo, TS strict base, ESLint, Prettier
- [x] M0: `packages/shared` API contract types
- [x] M0: `database` package — Drizzle schema (users), migration 0000,
      SQLite client, migration runner (verified against SQLite)

## Blocked
None currently. (Git commits are handled by the workflow, not the agent —
see the runtime note above.)

## Resume instructions
Read `AGENTS.md`, then `docs/ROADMAP.md`, inspect the repository, and continue
from the first unchecked task.
