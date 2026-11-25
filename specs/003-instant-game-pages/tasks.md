---
description: "Task list for instant navigation to game pages"
---

# Tasks: Instant navigation to game pages

**Input**: Design documents from `specs/003-instant-game-pages/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Not requested (no test suite). Each phase ends with its quickstart scenario.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: User story from spec.md (US1–US3)

---

## Phase 1: Setup

- [x] T001 Record the baseline at 1440 px on `main` behaviour for later comparison: for `/juegos/cometa-loca` and `/juegos/ladrillazo` note the detail grid columns (`getComputedStyle` of the `lg:grid-cols-[1.6fr_1fr]` element in `app/juegos/[slug]/page.tsx`; expected 956 / 333 and 1084 / 371) and the `<h1>` font size, so US1 and US3 can be checked against it (research R5)

## Phase 2: Foundational

None: the three stories touch independent concerns. US1 and US3 both edit
`app/juegos/[slug]/page.tsx`, so their tasks on that file run one after the other.

---

## Phase 3: User Story 1 – Opening a game's page feels instant (P1) 🎯 MVP

**Goal**: Clicking a game shows the detail skeleton at once, then the real page.

**Independent Test**: quickstart Scenario 1.

- [x] T002 [P] [US1] Create `components/detail/DetailSkeleton.tsx` (server component, no `"use client"`), following `components/catalog/CatalogSkeleton.tsx`: root `aria-busy="true"` and `aria-label="Cargando juego"`; desktop breadcrumb row (`hidden lg:flex px-12 pt-6`, three short `bg-panel` bars); the same grid as the page (`lg:grid lg:grid-cols-[1.6fr_1fr] lg:gap-10 lg:px-12 lg:pt-6`) with a striped trailer (`lm-stripes-lg grid aspect-video lg:rounded-md lg:border lg:border-line`) and an info column (`flex flex-col gap-4 p-5 lg:gap-[22px] lg:p-0`) of `bg-panel` blocks at the real heights: chips row 24 px, title 36 px / `lg:` 56 px, stats 44 px, JUGAR 60 px / `lg:` 72 px (`lm-scan`), buttons 52 px, controls panel (`hidden lg:block`, 3 rows ≈ 190 px); include one block with `lg:w-[333px]` so the grid resolves to the same 956 / 333 columns as a real page (research R4/R5); a "CARGANDO…" label (`font-mono text-[11px] tracking-[1.5px] text-muted`); below, `hidden lg:grid grid-cols-[1.6fr_1fr] gap-10 px-12 pt-14` with an "about" text block and a leaderboard block. Spanish only; no new colours or shadows
- [x] T003 [US1] Refactor `app/juegos/[slug]/page.tsx`: the default export `GameDetailPage({ params }: PageProps<"/juegos/[slug]">)` becomes a non-async function returning `<SiteShell active="juegos"><Suspense fallback={<DetailSkeleton />}><GameDetail params={params} /></Suspense></SiteShell>`; move the current body (everything inside `SiteShell`, including `await params`, `getGame`, `notFound()`, `getControls`, `leaderboard`, `similar`) into a new `async function GameDetail({ params }: Pick<PageProps<"/juegos/[slug]">, "params">)` in the same file, returning the same JSX (wrap it in a fragment). Keep `generateStaticParams` and `generateMetadata` unchanged (research R2–R3)
- [x] T004 [US1] Verify in the browser at 1440 px and 390 px that the skeleton's blocks line up with the real page (grid columns 956 / 333 on Cometa Loca during and after loading; no visible jump) and that the console no longer shows the instant-navigation message for `/juegos/[slug]`; adjust block heights in `components/detail/DetailSkeleton.tsx` if needed (FR-004, FR-006)

**Checkpoint**: quickstart Scenario 1 passes.

---

## Phase 4: User Story 2 – Pressing "Jugar" feels instant (P1)

**Goal**: The play screen frame in its loading state appears at once.

**Independent Test**: quickstart Scenario 2.

- [x] T005 [P] [US2] Create `components/game/PlaySkeleton.tsx` (server component) mirroring `GameScreen`'s loading state from `components/game/GameScreen.tsx` with no props: root `flex min-h-full flex-1 flex-col bg-deep`, `aria-busy="true"`, `aria-label="Cargando juego"`; desktop top bar (`hidden h-[52px] … lg:flex`) with "LA MAQUINITA" and the "Modo foco · la navegación se oculta mientras juegas" text but no exit link; mobile top bar (`h-11`) with an empty name slot; mobile HUD row with empty values; desktop three-column grid (`lg:grid-cols-[240px_1fr_240px]`) with three empty `HudBox`-style boxes on each side and the cabinet (same gradient and shadow as `GameScreen`) containing an empty title box and the game area (`aspect-[3/4] lg:aspect-[4/3]`, `bg-deep`) showing "CARGANDO" (`font-pixel text-xl text-cyan lg:text-[28px]`) and the empty 14-segment bar. Reuse the exact classes from `GameScreen.tsx`; no client code
- [x] T006 [US2] Refactor `app/juegos/[slug]/jugar/page.tsx`: the default export becomes a non-async `PlayPage({ params })` returning `<Suspense fallback={<PlaySkeleton />}><PlayFromParams params={params} /></Suspense>`; move the current body (`await params`, `getGame`, `notFound()`, holder lookup, `<GameScreen … />`) into `async function PlayFromParams({ params }: Pick<PageProps<"/juegos/[slug]/jugar">, "params">)`. Keep `generateStaticParams` and `generateMetadata`; no `SiteShell` ("modo foco")
- [x] T007 [US2] Verify in the browser that pressing ▶ JUGAR on Cometa Loca and Ladrillazo shows the skeleton frame immediately and then the game exactly as before (demo and real engine), and that the console shows no instant-navigation message for `/juegos/[slug]/jugar` (FR-002, FR-006)

**Checkpoint**: quickstart Scenario 2 passes.

---

## Phase 5: User Story 3 – Long game names fit their page (P2)

**Goal**: No detail page scrolls sideways; long titles fit.

**Independent Test**: quickstart Scenario 3.

- [x] T008 [P] [US3] Create `lib/titleFit.ts` exporting `titleEm(name: string): number`: uppercase the name, split on spaces, and return the largest per-word sum of Silkscreen advances in em from this table (research R6): `0.75` for A B C D G H J K O P Q R S U Á Ó Ú Ü ? ¿ and digits 0 2–9; `0.625` for E F L T Z É 1 -; `0.375` for I Í . ! ¡ : '; `0.875` for M N Ñ V W X Y; any other character `0.875`. Add a short comment that the values are exact (multiples of 1/8 em, no kerning) and how they were measured. No dependencies, no side effects
- [x] T009 [US3] In `app/juegos/[slug]/page.tsx` (after T003), wrap the `<h1>` in `<div className="@container">` and give the `<h1>` `style={{ "--title-em": titleEm(game.name) } as CSSProperties}` and the font-size classes `text-[min(36px,calc(100cqi/var(--title-em)))] lg:text-[min(56px,calc(100cqi/var(--title-em)))]` in place of `text-4xl lg:text-[56px]`; keep `lm-neon-pink font-pixel leading-none uppercase`. Expected: LADRILLAZO ≈ 50.3 px, FANTASMÍN ≈ 51.2 px, every other title 56 px (data-model §2)
- [x] T010 [P] [US3] In `lib/data.ts`, change Ladrillazo's `controls.desktop` to exactly 3 rows: `{ keys: ["←", "→", "A", "D"], label: "Mover la paleta (o el ratón)" }`, `{ keys: ["ESPACIO"], label: "Lanzar · continuar" }`, `{ keys: ["P"], label: "Pausa" }` (keep `hud`, `touch`, `tip`, `pad`); add a development-only check (`process.env.NODE_ENV !== "production"`) after `games` that throws `Error(\`${g.name}: el panel de controles admite como máximo 3 filas\`)`when any game's`controls.desktop` has more than 3 rows, with a comment that the detail layout depends on the panel's height (research R5, R7, FR-010)
- [x] T011 [US3] Verify at 1440 px and 390 px on all 12 detail pages that `document.documentElement.scrollWidth` equals the client width, titles are fully visible, Ladrillazo's columns are 956 / 333 like Cometa Loca's, and the 10 short titles are still 56 px (FR-007, FR-008, SC-004)

**Checkpoint**: quickstart Scenario 3 passes.

---

## Phase 6: Polish & cross-cutting concerns

- [x] T012 [P] Update `CLAUDE.md`: game pages read `params` inside `<Suspense>` with `DetailSkeleton` / `PlaySkeleton` (no top-level `await params` in pages); unknown slugs render the not-found page with status 200 + `noindex` (research R3); detail titles fit via `lib/titleFit.ts` and `@container`; the detail controls panel is limited to 3 rows
- [x] T013 Run the quality gates: `npm run lint`, `npx tsc --noEmit`, `npm run format:check`, `npm run build` (every `/juegos/[slug]` and `/juegos/[slug]/jugar` path still prerendered)
- [x] T014 Run quickstart Scenarios 1–5 at 390 px and 1440 px, including Scenario 4 (unknown slug, fast clicks, reduced motion) and Scenario 5 (home, catalog and rankings unchanged)

---

## Dependencies & execution order

- **Setup (T001)** first, so there is a baseline.
- **US1, US2, US3** are independent in behaviour. US1 and US3 share
  `app/juegos/[slug]/page.tsx`: T009 runs after T003.
- Within US1: T002 → T003 → T004. Within US2: T005 → T006 → T007. Within US3: T008 and T010 in
  parallel, then T009 (needs T003, T008), then T011.
- **Polish** after the stories.

### Parallel examples

```text
After T001:  T002 DetailSkeleton | T005 PlaySkeleton | T008 titleFit | T010 data.ts
Then:        T003 → T009 (same page file) | T006 play page
```

## Implementation strategy

1. **MVP**: T001–T004 (US1): the most frequent navigation becomes instant.
2. **US2**: T005–T007, the "Jugar" button.
3. **US3**: T008–T011, the layout fix (includes undoing feature 002's 5-row panel).
4. **Polish**: T012–T014, then PR.
