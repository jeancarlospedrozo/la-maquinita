# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

La Maquinita is a Spanish-language arcade games portal built with Next.js 16 (App Router), React 19, and Tailwind CSS v4. All UI copy is in Spanish. The screens come from the Claude Design project "La Maquinita.dc.html" (desktop 1440 px plus mobile 390 px variants). They are implemented responsively in one tree: unprefixed classes are mobile and `lg:` is desktop.

## Commands

```bash
npm run dev        # dev server (localhost:3000)
npm run build      # production build; also validates Cache Components prerender rules
npm run lint       # ESLint (next core-web-vitals + typescript, includes React Compiler rules)
npx tsc --noEmit   # typecheck; run `npx next typegen` first if PageProps/LayoutProps route types are missing
```

There is no test suite.

## Next.js config that shapes the code

`next.config.ts` enables `cacheComponents` and `partialPrefetching`. Consequences:

- Runtime data (`searchParams`, `cookies()`, etc.) must be read inside a `<Suspense>` boundary. `app/juegos/page.tsx` awaits `searchParams` in a child component wrapped in Suspense, and the fallback is `CatalogSkeleton`.
- Dynamic routes (`/juegos/[slug]`, `/juegos/[slug]/jugar`) use `generateStaticParams` over `games` so they prerender.
- Avoid `usePathname`/`useSearchParams` in shared layout chrome. Each page passes its active tab explicitly: `<SiteShell active="juegos">`.
- `Date.now()`/`Math.random()` are only used in client effects or handlers, never during render. `Countdown` starts at `null` and fills in after mount.
- Page and layout props use the global `PageProps<"/route">` / `LayoutProps<"/route">` helpers. `params` and `searchParams` are Promises.

## Architecture

- `lib/data.ts` holds all mock content (games, categories, rankings, tournament, current player) plus small helpers (`getGame`, `positionColor`, `pad2`). It stands in for a future API. `TODO` comments mark where real fetching or saving should go.
- `lib/useFavorites.ts` is a `localStorage`-backed favorites store shared through `useSyncExternalStore`.
- `components/SiteShell.tsx` wraps every portal page with the desktop nav, mobile top bar, footer, and the fixed mobile tab bar. The play screen (`/juegos/[slug]/jugar`) deliberately renders without it ("modo foco").
- `components/ui.tsx` holds server-safe shared primitives (`GameCard`, `Placeholder`, `BadgeTag`, `Blink`, `SegmentedTabs`, …). Interactive pieces live in `"use client"` files grouped per screen: `components/catalog`, `detail`, `game`, `rankings`.
- `components/game/GameScreen.tsx` is a state machine: `loading → start → playing ⇄ pause → over | record`. The canvas area is an empty slot for a real game engine. Until one exists, a demo mode simulates score and lives, so every state can be reached.

## Styling

- Design tokens are defined in `app/globals.css` via `@theme inline`. Colors include `ink`, `panel`, `line`, `text`, `muted`, `pink`, `cyan`, `gold`, `lime`, and `danger`. Fonts are `font-sans` (Space Grotesk), `font-mono` (JetBrains Mono), and `font-pixel` (Silkscreen), loaded with `next/font` in `app/layout.tsx`.
- Arcade effects are plain CSS classes prefixed `lm-` in `globals.css`: `lm-blink`, `lm-pulse`, `lm-scan`, `lm-stripes*` placeholders, `lm-btn-primary`, `lm-btn-ghost`, `lm-card`, `lm-neon-pink`, `lm-crt`. Reuse them rather than re-inlining glow and shadow values.
- The CRT scanline overlay is rendered once in the root layout. It is toggled through `html[data-crt="off"]` by `CrtToggle`. The blink, pulse, and scan animations respect `prefers-reduced-motion`.
