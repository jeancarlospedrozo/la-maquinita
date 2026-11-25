# Research: Supabase Integration

**Feature**: `001-supabase-integration` | **Date**: 2026-11-24

All Technical Context unknowns are resolved below. Spec clarifications (local Docker workflow,
`npm run db:check`, no session handling, `@supabase/ssr` installed, no secret key) are taken as fixed inputs.

## R1. Client libraries

- **Decision**: Add `@supabase/supabase-js` (2.x) and `@supabase/ssr` (0.12.x). The browser entry
  point uses `createBrowserClient` from `@supabase/ssr`; the server entry point uses
  `createClient` from `@supabase/supabase-js` with `persistSession: false` and
  `autoRefreshToken: false`. `createServerClient` (cookie-based) and `proxy.ts` are **not** used
  in this feature.
- **Rationale**: The user asked to install `@supabase/ssr` now and defer sessions. Building the
  browser client with `createBrowserClient` means the sessions feature reuses it unchanged (it
  already stores sessions in cookies the server can read later). A cookie-based server client
  would call `cookies()`, which under Cache Components forces per-request rendering; a stateless
  server client keeps pages prerenderable (FR-008, constitution III).
- **Alternatives considered**: `createServerClient` now with cookie adapter (rejected: is session
  handling, deferred); `proxy.ts` session refresh (rejected: deferred, adds per-request work);
  supabase-js only (rejected by the user).

## R2. Single entry point, server vs. browser

- **Decision**: Module folder `lib/supabase/`:
  - `config.ts`: pure, dependency-free reader that validates the public settings and returns either
    `{ ok: true, url, publishableKey }` or `{ ok: false, missing: string[] }`. Shared by Next.js
    code and the `db:check` script.
  - `server.ts`: `import "server-only"`; exports `getServerSupabase()` returning a typed client or
    `null` when not configured. The future home for any privileged key or cookie-based client.
  - `client.ts`: exports `getBrowserSupabase()`; lazily creates one shared `createBrowserClient`
    instance in the browser (singleton), or `null` when not configured.
  - `database.types.ts`: generated types (R6).
- **Rationale**: Satisfies FR-002 (one place), FR-004a (`server-only` makes the build fail if
  `server.ts` is imported from a Client Component; documented in bundled Next.js docs,
  "Preventing environment poisoning"), and FR-006 (`null` instead of throwing, so screens keep
  using `lib/data.ts`).
- **Alternatives considered**: one isomorphic module (rejected: cannot guarantee future
  server-only code never reaches a client bundle); throwing on missing config (rejected: breaks build/prerender when
  `.env` is absent, violating FR-006 / SC-005).

## R3. Environment variables

- **Decision**:

  | Variable                               | Exposure                       | Used in this feature           |
  | -------------------------------------- | ------------------------------ | ------------------------------ |
  | `NEXT_PUBLIC_SUPABASE_URL`             | public (inlined at build)      | yes                            |
  | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | public (inlined at build)      | yes                            |
  | `SUPABASE_DB_PASSWORD`                 | CLI only (already in template) | by `supabase link` / `db push` |
  | `SUPABASE_PROJECT_REF`                 | CLI only                       | by `supabase link`             |

- **Rationale**: Per the bundled Next.js env guide, only `NEXT_PUBLIC_`-prefixed variables are
  inlined into browser bundles; everything else stays in Node. Static `process.env.X` access
  (no dynamic lookup) is required for inlining to work. Public values are frozen at build time,
  which is fine because they do not change per environment build.
- **Alternatives considered**: legacy `anon` / `service_role` JWT keys (rejected: Supabase now
  issues publishable `sb_publishable_…` keys, which can be rotated independently). No secret key
  is configured in this feature (clarification).

## R4. Cache Components / prerender impact

- **Decision**: No page reads Supabase in this feature (FR-007). The clients read only
  `process.env` and never call `cookies()`/`headers()`, so importing them cannot make a route
  dynamic. When a future feature fetches public catalog data, it will do so inside `"use cache"`
  functions with `cacheLife`, keeping pages prerenderable (constitution III).
- **Rationale**: Keeps SC-003 (no speed change) trivially true and avoids premature design.
- **Alternatives considered**: a proof-of-concept read on a page (rejected: there are no tables and
  FR-007 forbids changing screen sources).

## R5. `db:check` command

- **Decision**: `scripts/db-check.ts`, run as
  `node --env-file-if-exists=.env scripts/db-check.ts` via `npm run db:check`. Node 24 strips
  TypeScript types natively, so no `tsx` dependency is needed. It imports `lib/supabase/config.ts`
  with a relative `.ts` path (requires `allowImportingTsExtensions`, valid because `noEmit` is set)
  and calls `GET {url}/auth/v1/health` with the publishable key in the `apikey` header.
  Outcomes: missing settings → exit 2; network/DNS/timeout (5 s) → "unreachable", exit 3;
  HTTP 401/403 → "rejected credentials", exit 4; 2xx → success, exit 0. See
  [contracts/db-check-cli.md](./contracts/db-check-cli.md).
- **Rationale**: The auth health endpoint exists on every project (remote and local) even with zero
  tables, and validates the API key, so it distinguishes the three failure modes the spec requires.
  Reusing `config.ts` guarantees "the same settings the portal uses" (FR-005).
- **Alternatives considered**: querying a table (rejected: none exist); `/rest/v1/` root
  (rejected: schema introspection is restricted for publishable keys); a dev-only route
  (rejected in clarification).

## R6. Local stack, migrations and types

- **Decision**: Add the `supabase` CLI as a devDependency (run via `npx supabase`). Run
  `supabase init` to create `supabase/config.toml` and `supabase/migrations/`. Workflow:
  `supabase start` (Docker) → `supabase migration new <name>` → `supabase db reset` (applies all
  migrations locally) → `supabase gen types typescript --local > lib/supabase/database.types.ts`
  → review in PR → `supabase link --project-ref $SUPABASE_PROJECT_REF` (once) →
  `supabase db push`. npm scripts wrap these (`db:start`, `db:stop`, `db:status`, `db:reset`, `db:types`, `db:link`,
  `db:push`, `db:check`).
- **Rationale**: Matches clarification Q1; pinning the CLI in `package.json` makes every developer
  use the same version. Types generated from the local instance mirror the committed migrations.
- **Alternatives considered**: global CLI install (rejected: version drift); generating types from
  the remote project (rejected: may include unreviewed changes).

## R7. Formatting / lint of generated and tool files

- **Decision**: Add `supabase/.temp`, `supabase/.branches` to `.gitignore`; exclude
  `lib/supabase/database.types.ts` from Prettier (`.prettierignore`) so regenerated output stays
  byte-identical (acceptance scenario US3-2).
- **Rationale**: Avoids the format hook rewriting generated files and causing false diffs.
