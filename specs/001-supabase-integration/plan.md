# Implementation Plan: Supabase Integration

**Branch**: `001-supabase-integration` | **Date**: 2026-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-supabase-integration/spec.md`

## Summary

Connect La Maquinita to the existing Supabase project without changing any screen. Add
`@supabase/supabase-js` and `@supabase/ssr` behind a single data-layer folder (`lib/supabase/`) with a pure config
reader, a `server-only` stateless server client and a lazy `createBrowserClient` browser client, both session-less (no cookies, no `proxy.ts`) and returning
`null` when unconfigured so the portal keeps running on `lib/data.ts`. Add a `npm run db:check`
script (Node 24 native TypeScript) that hits the auth health endpoint and reports
success / missing settings / unreachable / rejected key with distinct exit codes. Set up the
Supabase CLI local stack (Docker) with versioned migrations, generated types and npm wrappers, and
document everything in `.env.template` and `CLAUDE.md`. Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict) on Node 24; Next.js 16.4.5, React 19.3

**Primary Dependencies**: `@supabase/supabase-js` ^2.119 and `@supabase/ssr` ^0.12 (runtime); `supabase` CLI ^3.3 and
`server-only` (dev / build-time guard)

**Storage**: Supabase Postgres (remote project, empty `public` schema) + local stack in Docker.
No tables created in this feature.

**Testing**: No test suite (constitution). Validation via `db:check`, quality gates and manual
scenarios in [quickstart.md](./quickstart.md).

**Target Platform**: Web (Next.js server + browser); developer machines on Linux/macOS/WSL2

**Project Type**: Web application (single Next.js App Router project)

**Performance Goals**: Zero added work per request; same prerendered route output as `main`

**Constraints**: Cache Components on (no `cookies()`/runtime data outside Suspense); build must
pass with no `.env`; only `NEXT_PUBLIC_*` values reach the browser

**Scale/Scope**: ~6 new source/config files, 1 script, `package.json` scripts, docs updates

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                        | Assessment                                                                                                                                                                                     | Status |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Spanish-First Experience      | No UI changes. `db:check` messages are in Spanish.                                                                                                                                             | PASS   |
| II. Design Fidelity              | No screens touched; quickstart Scenario 3 verifies parity at 390/1440 px.                                                                                                                      | PASS   |
| III. Cache Components Compliance | Clients read only `process.env`, never cookies/headers; no page fetches Supabase; build verified with and without `.env`. Bundled Next.js docs consulted (env vars, `server-only`).            | PASS   |
| IV. Server-First Components      | No new components. Server client is guarded by `server-only`; browser client only for future client islands.                                                                                   | PASS   |
| V. Data Behind a Seam            | All access through `lib/supabase/`; `lib/data.ts` stays the screens' source; RLS-on-every-table rule documented; migrations versioned; secrets only in `.env`.                                 | PASS   |
| Tech constraints                 | New runtime deps (`@supabase/supabase-js`, `@supabase/ssr`) justified: required by the feature; `@supabase/ssr` requested by the user to prepare future sessions. CLI pinned as devDependency. | PASS   |
| Workflow & gates                 | Feature branch; lint, tsc, format:check, build in quickstart Scenario 6.                                                                                                                       | PASS   |

**Post-design re-check (after Phase 1)**: still PASS. The design adds no tables, no UI and no
per-request work; `allowImportingTsExtensions` in `tsconfig.json` is a config tweak, not a
principle deviation.

## Project Structure

### Documentation (this feature)

```text
specs/001-supabase-integration/
├── plan.md              # This file
├── research.md          # Phase 0 decisions (R1–R7)
├── data-model.md        # Config shapes, clients, generated types, migrations
├── quickstart.md        # Validation scenarios 1–7
├── contracts/
│   ├── environment.md   # Env variables contract
│   ├── db-check-cli.md  # npm run db:check behavior and exit codes
│   └── data-layer.md    # lib/supabase/* exports
└── tasks.md             # Phase 2 (/speckit-tasks; not created here)
```

### Source Code (repository root)

```text
lib/
├── data.ts                    # unchanged: mock data stays the screens' source
└── supabase/
    ├── config.ts              # NEW: pure env reader + validation (no imports)
    ├── server.ts              # NEW: "server-only"; getServerSupabase()
    ├── client.ts              # NEW: getBrowserSupabase() lazy createBrowserClient singleton
    └── database.types.ts      # NEW: generated by `npm run db:types` (Prettier-ignored)

scripts/
└── db-check.ts                # NEW: connection check (Node 24 type stripping)

supabase/                      # NEW: created by `supabase init`
├── config.toml
└── migrations/                # empty for now (.gitkeep)

.env.template                  # UPDATED: all variables from contracts/environment.md
.gitignore                     # UPDATED: supabase/.temp, supabase/.branches
.prettierignore                # UPDATED: lib/supabase/database.types.ts
tsconfig.json                  # UPDATED: allowImportingTsExtensions
package.json                   # UPDATED: deps + db:* scripts
CLAUDE.md                      # UPDATED: Supabase section (FR-011, FR-012)
```

npm scripts: `db:check`, `db:start`, `db:stop`, `db:status`, `db:reset`, `db:types`
(`supabase gen types typescript --local > lib/supabase/database.types.ts`), `db:link`
(`supabase link --project-ref $SUPABASE_PROJECT_REF`), `db:push`.

**Structure Decision**: Single Next.js project; the integration lives in `lib/supabase/` next to
the existing `lib/data.ts` seam, CLI artifacts in the conventional `supabase/` folder, and the
check script in a new top-level `scripts/` folder.

## Complexity Tracking

No constitution violations to justify.
