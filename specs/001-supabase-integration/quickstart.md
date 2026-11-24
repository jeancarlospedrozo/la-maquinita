# Quickstart & Validation: Supabase Integration

Run from the repository root. Contracts: [environment](./contracts/environment.md),
[db-check](./contracts/db-check-cli.md), [data layer](./contracts/data-layer.md).

## Prerequisites

- Node 24+, `npm install` done.
- Docker running (only for the local-stack scenarios).
- Access to the remote Supabase project (URL, publishable key, project ref, DB password).

## Scenario 1 — Remote connection (US1, SC-001)

1. `cp .env.template .env` and fill `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase dashboard (Project Settings → API Keys).
2. `npm run db:check` → prints `✓ Conectado a Supabase (...)`, exit code 0.

## Scenario 2 — Failure messages (US2-3, edge cases)

- Remove `NEXT_PUBLIC_SUPABASE_URL` from `.env` → `db:check` exits 2 naming the variable.
- Set the URL to `https://invalid.example.invalid` → exits 3 ("No se puede alcanzar").
- Set the key to `sb_publishable_wrong` → exits 4 ("rechazó la clave").

## Scenario 3 — Portal unchanged, with and without settings (US1-2, FR-006, SC-002, SC-005)

1. With `.env` filled: `npm run build` succeeds; the route summary shows the same static /
   partially prerendered routes as on `main`.
2. Rename `.env` away and run `npm run build` again → still succeeds.
3. `npm run dev`; compare home, `/juegos`, a detail page, `/juegos/<slug>/jugar` and `/rankings`
   at 390 px and 1440 px against `main` → identical.

## Scenario 4 — No secrets in the browser (US2-2, SC-004)

1. After `npm run build`: `grep -r "sb_secret_" .next/static` → no matches.
2. `git log -p | grep "sb_secret_\|sb_publishable_[A-Za-z0-9]\{20,\}"` → no real keys.
3. Temporarily import `lib/supabase/server.ts` from a `"use client"` file → `npm run build`
   fails with a `server-only` error. Revert.

## Scenario 5 — Local stack, migrations and types (US3, FR-009/009a/010)

1. `npm run db:start` → Docker containers start; `npm run db:status` prints the local URL and
   publishable key.
2. Point `.env` at the local stack (see environment contract) → `npm run db:check` exit 0.
3. `npm run db:reset` → applies migrations from scratch (none yet) without error.
4. `npm run db:types` → `git diff --exit-code lib/supabase/database.types.ts` is clean.
5. `npm run db:stop`.
6. (Once per clone, against remote) `npm run db:link`; `npm run db:push` reports no pending
   migrations.

## Scenario 6 — Quality gates (SC-006)

`npm run lint && npx tsc --noEmit && npm run format:check && npm run build` all pass.

## Scenario 7 — Guidance (SC-001, FR-011)

A teammate on a fresh clone follows only `CLAUDE.md` + `.env.template` and reaches Scenario 1 in
under 10 minutes.
