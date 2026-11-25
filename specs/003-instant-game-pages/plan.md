# Implementation Plan: Instant navigation to game pages

**Branch**: `003-instant-game-pages` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-instant-game-pages/spec.md`

## Summary

Make client navigations to `/juegos/[slug]` and `/juegos/[slug]/jugar` instant by turning both
pages into non-async components that render the slug-independent shell and await `params` inside
a `<Suspense>` child, with skeletons in the portal's style (`DetailSkeleton`, `PlaySkeleton`).
Fix the Ladrillazo horizontal scroll at its two causes found in research: the 5-row controls
panel added in 002 (back to 3 rows, with a dev check) and long one-word titles (container-query
font size computed from exact Silkscreen glyph widths). Details: [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict); Next.js 16.4.5 (`cacheComponents`,
`partialPrefetching`), React 19.3, Tailwind CSS v4

**Primary Dependencies**: None new

**Storage**: N/A (mock data in `lib/data.ts`)

**Testing**: No test suite (constitution). Manual scenarios in [quickstart.md](./quickstart.md)
and quality gates

**Target Platform**: Modern desktop and mobile browsers

**Project Type**: Web application (single Next.js App Router project)

**Performance Goals**: Screen changes within 0.1 s of a click on a game link (SC-001)

**Constraints**: Both routes stay prerendered for every game; final markup of both pages and every
other page unchanged except Ladrillazo's controls panel and long titles; no layout jump on the
skeleton → content swap

**Scale/Scope**: 2 pages, 2 new skeleton components, 1 small helper, 1 data change

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                        | Assessment                                                                                                                                                                                                                  | Status |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Spanish-First Experience      | Skeletons only show "CARGANDO…"/"CARGANDO" and Spanish ARIA labels ("Cargando juego"). Ladrillazo's regrouped controls stay in Spanish.                                                                                     | PASS   |
| II. Design Fidelity              | Skeletons reuse tokens and `lm-*` placeholder classes; detail columns keep today's 956 / 333 rendering (research R5); titles that fit keep 56 px; animations via `lm-scan`/`lm-blink` respect reduced motion.               | PASS   |
| III. Cache Components Compliance | This feature is the fix for this principle: `params` read inside `<Suspense>` with meaningful skeletons; `generateStaticParams` kept; bundled docs checked (instant, optimizing-prefetching, not-found, generate-metadata). | PASS   |
| IV. Server-First Components      | Skeletons and the title helper are server code; no new client components. Play screen keeps rendering without `SiteShell`.                                                                                                  | PASS   |
| V. Data Behind a Seam            | Data still read through `lib/data.ts`; the 3-row rule lives there.                                                                                                                                                          | PASS   |
| Tech constraints                 | No new dependencies.                                                                                                                                                                                                        | PASS   |
| Workflow & gates                 | Feature branch; quickstart Scenario 6 runs all gates; manual checks at 390/1440 px.                                                                                                                                         | PASS   |

**Post-design re-check (after Phase 1)**: still PASS. One behaviour change to note, not a
violation: unknown slugs now render the not-found page with status 200 + `noindex` instead of
404, because `notFound()` runs after streaming starts and `dynamicParams` is unavailable with
Cache Components (research R3).

## Project Structure

### Documentation (this feature)

```text
specs/003-instant-game-pages/
├── plan.md              # This file
├── research.md          # R1–R7
├── data-model.md        # controls rule, titleEm
├── quickstart.md        # Validation scenarios 1–6
└── tasks.md             # Phase 2 (/speckit-tasks; not created here)
```

No `contracts/`: the feature exposes no interface to other systems or modules.

### Source Code (repository root)

```text
app/juegos/[slug]/
├── page.tsx              # UPDATED: non-async page → SiteShell + <Suspense fallback={<DetailSkeleton/>}>
│                         #   <GameDetail params={params}/>; h1 in @container with --title-em
└── jugar/page.tsx        # UPDATED: non-async page → <Suspense fallback={<PlaySkeleton/>}>
                          #   <PlayFromParams params={params}/>

components/
├── detail/DetailSkeleton.tsx   # NEW (server): detail page placeholder
└── game/PlaySkeleton.tsx       # NEW (server): play screen loading frame

lib/
├── titleFit.ts           # NEW: Silkscreen advance table + titleEm(name)
└── data.ts               # UPDATED: Ladrillazo controls → 3 rows; dev check (≤ 3 rows)

CLAUDE.md                 # UPDATED: game pages read params inside Suspense; title fit; 3-row rule
```

**Structure Decision**: Single Next.js project; skeletons live next to the screens they mirror
(`components/detail`, `components/game`), following `components/catalog/CatalogSkeleton.tsx`.

## Complexity Tracking

No constitution violations to justify.
