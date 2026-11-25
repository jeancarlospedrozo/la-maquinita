# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

La Maquinita is a Spanish-language arcade games portal built with Next.js 16 (App Router), React 19, and Tailwind CSS v4. All UI copy is in Spanish, except the design's arcade terms "PRESS START", "GAME OVER" and "INSERT COIN TO CONTINUE" (closed list, constitution Principle I). The screens come from the Claude Design project "La Maquinita.dc.html" (desktop 1440 px plus mobile 390 px variants). They are implemented responsively in one tree: unprefixed classes are mobile and `lg:` is desktop.

## Commands

```bash
npm run dev        # dev server (localhost:3000)
npm run build      # production build; also validates Cache Components prerender rules
npm run lint       # ESLint (next core-web-vitals + typescript, includes React Compiler rules)
npm run format     # Prettier (with prettier-plugin-tailwindcss class sorting); format:check to verify
npx tsc --noEmit   # typecheck; run `npx next typegen` first if PageProps/LayoutProps route types are missing
npm run db:check   # verify the Supabase connection (exit 0 ok · 2 config · 3 unreachable · 4 key rejected)
```

The `db:*` scripts for the Supabase CLI are listed under [Supabase](#supabase).

There is no test suite.

A project hook (`.claude/settings.json` → `.claude/hooks/format-and-lint.mjs`) runs Prettier and, for JS/TS files, `eslint --fix` after every Write/Edit. Unfixable ESLint errors are reported back (exit 2) and must be fixed.

## Next.js config that shapes the code

`next.config.ts` enables `cacheComponents` and `partialPrefetching`. Consequences:

- Runtime data (`searchParams`, `cookies()`, etc.) must be read inside a `<Suspense>` boundary. `app/juegos/page.tsx` awaits `searchParams` in a child component wrapped in Suspense, and the fallback is `CatalogSkeleton`.
- Dynamic routes (`/juegos/[slug]`, `/juegos/[slug]/jugar`) use `generateStaticParams` over `games` so they prerender.
- Avoid `usePathname`/`useSearchParams` in shared layout chrome. Each page passes its active tab explicitly: `<SiteShell active="juegos">`.
- `Date.now()`/`Math.random()` are only used in client effects or handlers, never during render. `Countdown` starts at `null` and fills in after mount.
- Page and layout props use the global `PageProps<"/route">` / `LayoutProps<"/route">` helpers. `params` and `searchParams` are Promises.

## Architecture

- `lib/data.ts` holds all mock content (games, categories, rankings, tournament, current player) plus small helpers (`getGame`, `positionColor`, `pad2`). It stands in for a future API. `TODO` comments mark where real fetching or saving should go.
- `lib/supabase/` is the only place that creates Supabase clients (see [Supabase](#supabase)). Screens still read `lib/data.ts`.
- `lib/useFavorites.ts` is a `localStorage`-backed favorites store shared through `useSyncExternalStore`.
- `components/SiteShell.tsx` wraps every portal page with the desktop nav, mobile top bar, footer, and the fixed mobile tab bar. The play screen (`/juegos/[slug]/jugar`) deliberately renders without it ("modo foco").
- `components/ui.tsx` holds server-safe shared primitives (`GameCard`, `Placeholder`, `BadgeTag`, `Blink`, `SegmentedTabs`, …). Interactive pieces live in `"use client"` files grouped per screen: `components/catalog`, `detail`, `game`, `rankings`.
- `components/game/GameScreen.tsx` is a state machine: `loading → start → playing ⇄ pause → over | record` (plus `error` when a real engine's assets fail to load). Games with `engine` set in `lib/data.ts` mount a real engine in the canvas area; every other game keeps the demo mode, which simulates score and lives so every state can be reached.
- Real engines live in `lib/games/<slug>/`: framework-free TypeScript with no import-time side effects, created inside an effect and released with `destroy()` on unmount. They are registered in `components/game/engines.ts` (`next/dynamic` with `ssr: false`), follow the contract in `specs/002-arkanoid-integration/contracts/engine.md`, and load their assets from `public/games/<slug>/`. The engine draws no text: notices and end screens are portal overlays. Ladrillazo is the first one (ported from `references/arkanoid/`, which stays untouched and is ignored by ESLint and Prettier).
- Per-game copy for controls, the loading tip, the touch pad, the personal best, the record holder and the detail-page leaderboard comes from optional `Game` fields (`controls`, `personalBest`, `recordHolder`, `leaderboard`), with the shared defaults as fallback.

## Styling

- Design tokens are defined in `app/globals.css` via `@theme inline`. Colors include `ink`, `panel`, `line`, `text`, `muted`, `pink`, `cyan`, `gold`, `lime`, and `danger`. Fonts are `font-sans` (Space Grotesk), `font-mono` (JetBrains Mono), and `font-pixel` (Silkscreen), loaded with `next/font` in `app/layout.tsx`.
- Arcade effects are plain CSS classes prefixed `lm-` in `globals.css`: `lm-blink`, `lm-pulse`, `lm-scan`, `lm-stripes*` placeholders, `lm-btn-primary`, `lm-btn-ghost`, `lm-card`, `lm-neon-pink`, `lm-crt`. Reuse them rather than re-inlining glow and shadow values.
- Matching the design pixel-for-pixel depends on two quirks of the reference. First, it inherits `line-height: normal`, so `globals.css` resets Tailwind's 1.5 default, including the `--text-*--line-height` tokens. Second, it uses `box-sizing: content-box`, so a border adds to the declared size. Give any element with both an explicit size (`h-*`, `size-*`, `w-*`, `aspect-*`) and a border the `box-content` class.
- `lm-*` classes live in `@layer components`, so Tailwind utilities can override them (e.g. `max-lg:shadow-[…]` on `lm-btn-primary`).
- The CRT scanline overlay is rendered once in the root layout. It is toggled through `html[data-crt="off"]` by `CrtToggle`. The blink, pulse, and scan animations respect `prefers-reduced-motion`.

## Supabase

The portal is connected to a Supabase project, but no screen reads from it yet: `lib/data.ts` is still the source for all content. Spec: `specs/001-supabase-integration/`.

### Entry points (`lib/supabase/`)

- `config.ts`: `readSupabaseConfig()` validates the public env vars. It has no imports, so `scripts/db-check.ts` can use it too.
- `server.ts`: `getServerSupabase()`. It is guarded by `server-only`, so importing it from a Client Component fails the build. It is stateless: it never reads cookies or headers, so it never makes a route dynamic.
- `client.ts`: `getBrowserSupabase()`. It returns one `createBrowserClient` (`@supabase/ssr`) instance per tab. It returns `null` during server render, so call it from effects or handlers.
- `database.types.ts`: generated by `npm run db:types`. Never edit it by hand.

Both getters return `null` when the config is missing. Callers must fall back to `lib/data.ts`, so the build and every page work without `.env.local`.

Components and pages never import `@supabase/*` directly.

Sessions are not set up yet. Neither the cookie-based `createServerClient` nor `proxy.ts` session refresh exists; both will arrive with the sessions feature. Any server read that needs a user session must live inside `<Suspense>` (Cache Components).

### Environment

Copy `.env.template` to `.env.local` (git-ignored). A plain `.env` is still read as a fallback, but `.env.local` takes precedence, as in Next.js.

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are public and inlined into the browser bundle. Use only the publishable key (`sb_publishable_…`); a `sb_secret_…` value is rejected as invalid.
- `SUPABASE_PROJECT_REF` and `SUPABASE_DB_PASSWORD` are used only by the CLI scripts.
- No secret or service-role key is configured. If one is ever needed, read it only inside `lib/supabase/server.ts` and never give it the `NEXT_PUBLIC_` prefix.
- The hosting environment needs the two `NEXT_PUBLIC_*` variables set at build time.

### Database workflow

Migrations are developed locally first. The local stack needs Docker.

```bash
npm run db:start                      # start local Supabase (Docker); prints local URL and keys
npm run db:status                     # show local URL / publishable key again
npx supabase migration new <name>     # creates supabase/migrations/<timestamp>_<name>.sql
npm run db:reset                      # re-apply all migrations from scratch on the local DB
npm run db:types                      # regenerate lib/supabase/database.types.ts from the local DB
npm run db:stop
# after PR review, once per machine: npx supabase login
npm run db:push -- --dry-run          # preview what would be applied to the remote project
npm run db:push                       # apply pending migrations to the remote project
```

To run the portal against the local stack, set `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` and use the publishable key from `db:status` in `.env.local`. Restore the remote values afterwards.

Rules:

- Never try out schema changes on the remote project. Every change is a migration file committed with its regenerated `database.types.ts`.
- Every new table MUST enable Row Level Security in the same migration that creates it, with explicit policies. Anything not allowed is denied.
