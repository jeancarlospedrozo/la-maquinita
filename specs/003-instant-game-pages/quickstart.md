# Quickstart: validate instant game pages

**Feature**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

No automated tests (constitution). Manual checks at 390 px and 1440 px.

```bash
npm run dev   # http://localhost:3000
```

## Scenario 1 – Detail page is instant (US1, FR-001, FR-004, FR-006)

1. Open `/juegos`, open DevTools → Network → throttle "Slow 4G".
2. Click a game card → the detail skeleton (portal nav and footer visible, striped trailer, info
   blocks, "CARGANDO…") appears at once; then the real page replaces it without blocks jumping.
3. Click a "Juegos similares" card → same behaviour.
4. Remove throttling; browser console shows **no** "Next.js encountered URL data during
   prerendering or a navigation" message for `/juegos/[slug]`.
5. Load `/juegos/ladrillazo` directly → complete page as before.

## Scenario 2 – Play screen is instant (US2, FR-002, FR-006)

1. With throttling, press **▶ JUGAR** on Cometa Loca and on Ladrillazo → the play frame with the
   "CARGANDO" state appears at once (no site nav), then the game continues as before (demo /
   real engine).
2. **← Salir** → detail skeleton appears at once.
3. Console: no instant-navigation message for `/juegos/[slug]/jugar`.

## Scenario 3 – Titles and horizontal scroll (US3, FR-007, FR-008, FR-010)

1. At 1440 px open all 12 detail pages. On each, `document.documentElement.scrollWidth` equals
   the window's client width (no horizontal scroll) and the title is fully visible.
2. LADRILLAZO and FANTASMÍN are slightly smaller than 56 px and fit their column; every other
   title is 56 px as before.
3. Ladrillazo's controls panel shows 3 rows (← → A D / ESPACIO / P) and the page columns match
   Cometa Loca's (trailer 956 px, info 333 px).
4. Repeat at 390 px: no horizontal scroll, titles 36 px.

## Scenario 4 – Edge cases

1. Navigate to `/juegos/no-existe` → the portal's not-found page shows (skeleton does not stay).
2. Click three game cards quickly → only the last game ends up on screen.
3. With `prefers-reduced-motion: reduce` emulated, skeleton animations are still.

## Scenario 5 – Nothing else changed (FR-009, SC-005)

Home, catalog, rankings and the final content of both pages look as before (compare with
`main`).

## Scenario 6 – Quality gates

```bash
npm run lint && npx tsc --noEmit && npm run format:check && npm run build
```

The build still lists every `/juegos/[slug]` and `/juegos/[slug]/jugar` path as prerendered.
