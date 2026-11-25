# Research: Instant navigation to game pages

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Date**: 2026-11-25

Sources: bundled Next.js 16.4.5 docs (`node_modules/next/dist/docs/01-app/`) and measurements in
the running app at 1440 px.

---

## R1. Why both pages are flagged as non-instant

- **Finding**: With `cacheComponents` + `partialPrefetching`, development validates that client
  navigations into each page render UI immediately (`instant` route config, default
  `validationLevel: 'warning'`, dev only, build unaffected). Both `GameDetailPage` and `PlayPage`
  `await params` at the top of the page, outside any `<Suspense>`, so nothing below the shared
  layout can render until the server responds.
- **Key doc point** (`02-guides/optimizing-prefetching.md`): "`params` needs a `<Suspense>`
  boundary, even when the values are predefined by `generateStaticParams`. A statically known
  param still belongs to one URL."

## R2. Fix pattern for the pages

- **Decision**: Make each page component non-async. It renders the parts that do not depend on
  the slug and passes the `params` promise to an async child wrapped in
  `<Suspense fallback={<Skeleton />}>`; the child awaits `params`, looks the game up and renders
  the current markup unchanged. Same pattern as `app/juegos/page.tsx` (`CatalogFromParams` +
  `CatalogSkeleton`) and the docs' `ProductInfo` example (`02-guides/instant-navigation.md`).
  - Detail page: `<SiteShell active="juegos">` stays outside the boundary (chrome is instant);
    the boundary wraps the whole page body.
  - Play page: no `SiteShell` ("modo foco"); the boundary wraps `GameScreen`.
- **Rationale**: Smallest change that removes the warning (FR-006) while keeping prerendering
  (`generateStaticParams` stays, FR-005) and the final markup identical (FR-009).
- **Alternatives considered**: `export const instant = false` (silences the warning but keeps the
  blocking navigation, contradicts FR-001/FR-002); `prefetch={true}` on every game link (needs the
  same boundary first and costs a server request per link — rejected in the spec's Assumptions).

## R3. `generateMetadata` and `notFound()` after the change

- **`generateMetadata`** keeps awaiting `params`. Docs (`generate-metadata.md` § With Cache
  Components): when other parts of the page also defer to request time, metadata streams with
  them; no error. Both pages now defer inside their boundary, so this holds.
- **`notFound()`** moves inside the Suspense child. Docs (`not-found.md` § Calling `notFound()`
  after streaming has started): the not-found UI still renders, the response keeps status `200`
  and Next.js injects `noindex`. `dynamicParams = false` is not available with Cache Components
  (`migrating-to-cache-components.md`). Unknown slugs therefore show the portal's not-found page
  with `noindex` instead of an HTTP 404. Accepted: all real slugs are prerendered, and search
  engines still drop the page.

## R4. Skeletons

- **Decision**:
  - `components/detail/DetailSkeleton.tsx` (server component): same outer grid classes as the
    detail page, striped trailer (`lm-stripes-lg`, `aspect-video`), info column with `bg-panel`
    blocks at the real heights (chips row, 56 px title, stats, 72 px JUGAR, 52 px buttons,
    3-row controls panel), and the lower sections ("Sobre el juego", leaderboard) as blocks. The
    info column's blocks are sized so the grid resolves to the same columns as a real page
    (see R5): a fixed-width block of 333 px stands in for the content that sets the column today.
    `aria-busy`, `aria-label="Cargando juego"`, a "CARGANDO…" label like `CatalogSkeleton`.
  - `components/game/PlaySkeleton.tsx` (server component): the play screen frame (top bars,
    HUD boxes with empty values, cabinet with the game name slot empty and the "CARGANDO" bar at
    0), mirroring `GameScreen`'s loading state so the swap is seamless.
  - Animation only via existing `lm-scan` / `lm-blink`, which already respect
    `prefers-reduced-motion`.
- **Rationale**: FR-001–FR-004; reuses the catalog skeleton's visual language.

## R5. Root cause of the horizontal scroll on Ladrillazo

Measured at 1440 px (`lg:grid-cols-[1.6fr_1fr]`, content width 1329 px, gap 40 px):

| Page                                   | Columns        | Info column height | Result                                                |
| -------------------------------------- | -------------- | ------------------ | ----------------------------------------------------- |
| Cometa Loca                            | 956 / 333      | 594                | fits (1329)                                           |
| Ladrillazo, 3-row panel (as on `main`) | 956 / **371**  | ~576               | grid 38 px too wide, hidden by the 48 px page padding |
| Ladrillazo, 5-row panel (feature 002)  | **1084** / 371 | 610                | 166 px too wide → page scrolls                        |

- The trailer has `aspect-video`; its automatic minimum width is derived from the row height
  (538 px × 16/9 = 956 px). That is why every detail page renders 956 / 333 instead of a true
  1.6 : 1 split — and that rendering is today's design baseline, so it must not change.
- A taller info column (5 controls rows) raises the row height → larger trailer minimum → the
  right column is pushed out.
- The title is one unbreakable word; its min-content width (371 px for LADRILLAZO, 364 px for
  FANTASMÍN at 56 px) is wider than the 333 px column the other content sets.
- Verified in the browser: putting the title in an inline-size container **and** limiting the
  panel to 3 rows gives 956 / 333 on Ladrillazo, identical to every other page, with no page
  scroll.

## R6. Fitting the title

- **Decision**: Wrap the `<h1>` in a `@container` (inline-size). The `<h1>` font size becomes
  `min(56px, 100cqi / <longest word width in em>)` on desktop and `min(36px, …)` on mobile. The
  longest word width in em is computed on the server from a table of Silkscreen advance widths
  (`lib/titleFit.ts`), passed as a CSS variable.
- **Measured advances** (Silkscreen, uppercase, no kerning, exact multiples of 1/8 em): most
  letters 0.75; E F L T Z 0.625; I Í 0.375; M N Ñ V W X Y 0.875; space 0.5; digits 0.75 (1 →
  0.625). The sum for LADRILLAZO is 6.625 em, equal to the measured word width. Unknown
  characters fall back to 0.875 (widest), which can only make a title slightly smaller, never
  overflow.
- **Effect**: LADRILLAZO → 333 / 6.625 ≈ 50.3 px; FANTASMÍN → ≈ 51.2 px; every other game's
  longest word fits at 56 px, so `min()` keeps 56 px (FR-007, SC-005). Mobile titles (36 px)
  already fit 350 px, so they stay 36 px.
- **Why a container**: an inline-size container contributes 0 to its column's min-content, so the
  title can no longer widen the column; the column keeps being set by the rest of the content
  (333 px), and `cqi` gives the title that width.
- **Alternatives considered**: a client-side "fit text" hook (layout shift on hydration, extra
  client code); a per-character average (over-shrinks titles with I/L, under-shrinks M/W);
  hard-coding a smaller size for Ladrillazo (not general, FR-007).

## R7. Ladrillazo's controls panel

- **Decision**: Regroup Ladrillazo's `controls.desktop` into 3 rows:
  `["←","→","A","D"]` "Mover la paleta (o el ratón)", `["ESPACIO"]` "Lanzar · continuar",
  `["P"]` "Pausa". Add a dev-only check in `lib/data.ts` that `desktop` has at most 3 rows,
  with a comment explaining the layout dependency (R5).
- **Rationale**: FR-010. The first row has 4 keys like the default panel's arrows, so the panel
  keeps the design's height and width.
