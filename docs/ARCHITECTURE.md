# Architecture

## Stack decision (recorded before implementation)

| Concern | Choice | Rationale |
| --- | --- | --- |
| Monorepo layout | npm workspaces | No extra tooling; Node 22 / npm 10 support it natively. |
| Frontend | React 18 + Vite + TypeScript | Fast, type-safe, mobile-first SPA that fits the Telegram WebView. |
| Styling | Tailwind CSS | Utility-first, small bundles, easy theming + RTL support. |
| Backend | Node.js + Fastify + TypeScript | Type-safe boundaries, low overhead, mature plugin ecosystem. |
| Database | SQLite via `better-sqlite3` + Drizzle ORM | Zero-external-service local dev/test runs; type-safe schema + migrations. |
| Production DB path | Drizzle Postgres dialect (documented) | Schema is defined once; swapping the dialect is a documented migration. |
| Sessions | Signed JWT (HS256) issued after Telegram initData verification | Avoids third-party cookie issues in the Telegram WebView. |
| Tests | Vitest (unit + integration) | One runner across workspaces; fast native ESM. |
| Lint / format | ESLint + Prettier | Shared config at the repo root. |
| CI | GitHub Actions (`.github/workflows/ci.yml`) | Runs type-check, lint, tests, and build on every push. |

## Repository layout

```
frontend/          Telegram Mini App UI (Vite SPA)
backend/           Fastify API + Telegram authorization
database/          Drizzle schema, generated migrations, seed
packages/shared/   Shared request/response types (type-safe boundaries)
docs/              Product and operational documentation
```

## Architecture boundaries

- **Frontend** never talks to the database; it only calls versioned REST endpoints
  (`/api/...`) with a Bearer token obtained from `/api/auth/telegram`.
- **Backend** validates every untrusted input (Zod schemas) and authorizes every
  protected resource against the caller encoded in the verified JWT. Every
  query is scoped by `user_id`.
- **Database** owns schema and migrations. Migrations are additive and
  reversible; schema changes never delete data without a documented migration.
- **packages/shared** holds only types — no runtime logic — so the frontend and
  backend cannot drift on API contracts.

## Telegram identity & security

1. The Mini App reads `window.Telegram.WebApp.initData` and posts it to
   `POST /api/auth/telegram`.
2. The backend rebuilds the `data_check_string`, verifies the HMAC-SHA256
   signature against a key derived from the bot token, and checks
   `auth_date` freshness (constant-time comparison, configurable window).
3. Only after verification is a user record created/updated and a short-lived
   JWT issued. Unverified requests never reach protected handlers.
4. Telegram identity data (name, username, photo) is stored only when needed for
   the documented user-profile feature.

## Environment & configuration

All runtime configuration comes from environment variables (see `.env.example`).
The backend fails fast on missing required variables in production and uses safe
local defaults in development. Local development mocks exist for the Telegram
WebApp context so the frontend runs without a bot.

## Time handling

Timestamps are stored as UTC integers/ISO strings. Conversion to the user's
locale/timezone happens only at the UI boundary.

## Health-related features

Mood, journal, cycle, sleep, and water features are lifestyle/wellness tools.
They are not medical devices; the UI ships disclaimers, and no diagnostic
advice is generated.
