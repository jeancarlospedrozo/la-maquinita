# Feature Specification: Instant navigation to game pages

**Feature Branch**: `003-instant-game-pages`

**Created**: 2026-11-25

**Status**: Draft

**Input**: User description: "navegación instantánea en las páginas de juego: mover el await params de /juegos/[slug] y /juegos/[slug]/jugar dentro de <Suspense> con un esqueleto acorde al diseño, y corregir el desbordamiento horizontal del título largo (LADRILLAZO) en la ficha a 1440 px"

**Scope note**: Two issues found while building feature 002 and already present on `main`. (1) Moving
inside the portal to a game's detail page or play screen waits for the server before anything
changes on screen; the framework flags both pages in development (present on `main` before 002).
(2) On the Ladrillazo detail page at 1440 px the whole page scrolls sideways. Planning found two
causes: the title "LADRILLAZO" (and "FANTASMÍN") is wider than its column, which `main` already
had but hid inside the page margin; and feature 002 gave Ladrillazo a 5-row controls panel, which
makes the info column taller and, through the trailer's 16:9 shape, pushes the columns past the
page edge. No content, data or gameplay changes beyond fixing that panel.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Opening a game's page feels instant (Priority: P1)

A visitor browsing the catalog, the home page or the rankings clicks a game. The game's detail
page responds the moment they click: the portal chrome (navigation, footer, tab bar) stays in place
and a placeholder in the shape of the detail page appears immediately, then fills in with the
game's content.

**Why this priority**: This is the most common navigation in the portal; a click that seems to do
nothing for a moment makes the whole site feel slow.

**Independent Test**: From the catalog, click several games in a row (desktop and mobile widths)
and watch that the screen changes immediately on every click, before the content arrives.

**Acceptance Scenarios**:

1. **Given** the visitor is on the catalog, **When** they click a game card, **Then** the detail
   page's placeholder (in the portal's style, with the same layout as the detail page) is shown
   at once, and the real content replaces it without the layout jumping.
2. **Given** the visitor is on a game's detail page, **When** they click a "Juegos similares"
   card, **Then** the same instant placeholder appears for the new game.
3. **Given** the visitor opens a detail page URL directly (typed or shared link), **When** the
   page loads, **Then** it shows the complete page exactly as today.

---

### User Story 2 - Pressing "Jugar" feels instant (Priority: P1)

A visitor on a game's detail page presses "▶ JUGAR". The play screen ("modo foco") appears at
once with its cabinet and loading screen, without first waiting on a blank or frozen page.

**Why this priority**: It is the main call to action of the portal; any hesitation right before
playing is the worst moment for it.

**Independent Test**: On several detail pages press "▶ JUGAR" and check that the cabinet with the
loading screen appears immediately, for both a demo game and Ladrillazo (real engine).

**Acceptance Scenarios**:

1. **Given** the visitor is on a detail page, **When** they press "▶ JUGAR", **Then** the play
   screen frame and its "CARGANDO" state appear at once, and the game (demo or real engine)
   continues from there exactly as today.
2. **Given** the visitor is on the play screen, **When** they press "← Salir", **Then** the
   detail page's instant placeholder appears (Story 1).

---

### User Story 3 - Long game names fit their page (Priority: P2)

A visitor opens a game whose name is long (e.g. "LADRILLAZO") on a 1440 px wide screen. The title
fits next to the trailer, nothing overflows and the page never scrolls sideways.

**Why this priority**: A visible layout bug on a featured game, but it does not block any action.

**Independent Test**: Open the detail page of every game at 1440 px and at 390 px and check that
the page has no horizontal scroll and the title is fully visible.

**Acceptance Scenarios**:

1. **Given** the Ladrillazo detail page at 1440 px, **When** it is shown, **Then** the whole title
   is visible inside its column, the "▶ JUGAR" button and side panels keep their design width,
   and the page has no horizontal scroll.
2. **Given** any game detail page at 390 px or 1440 px, **When** it is shown, **Then** there is no
   horizontal scroll and no title is cut.
3. **Given** a game whose name already fits (e.g. "Cometa Loca"), **When** its page is shown,
   **Then** the title looks exactly as today.

---

### Edge Cases

- Unknown game slug: navigating to it still shows the portal's existing "not found" page; the
  placeholder must not stay on screen forever.
- Very fast clicks on several games in a row: only the last chosen game's content ends up on
  screen.
- Slow connection: the placeholder stays visible (with the portal chrome usable) until the content
  arrives, rather than a frozen previous page.
- Reduced motion: any placeholder animation respects the visitor's reduced-motion preference.
- The play screen keeps rendering without the site navigation ("modo foco"), including its
  placeholder.
- A game name longer than "LADRILLAZO" added in the future still fits (the rule is general, not
  tuned to one name).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Navigating inside the portal to a game's detail page MUST change the screen
  immediately, showing a placeholder that keeps the portal chrome and mirrors the detail page's
  layout (breadcrumbs, trailer area, title/info column, sections below) at both 390 px and
  1440 px.
- **FR-002**: Navigating inside the portal to a game's play screen MUST immediately show the play
  screen frame ("modo foco", no site navigation) in its loading state.
- **FR-003**: The placeholders MUST use the portal's existing visual language (tokens, placeholder
  stripes, fonts) and contain no English text other than the arcade terms allowed by Constitution
  Principle I.
- **FR-004**: When the real content arrives it MUST replace the placeholder without the page
  layout visibly jumping (same block sizes and positions).
- **FR-005**: Direct visits to both pages MUST keep showing the complete page as today, and both
  pages MUST still be generated ahead of time for every game in the catalog.
- **FR-006**: The development warnings about non-instant navigation for these two pages MUST no
  longer appear.
- **FR-007**: The detail page title MUST always fit its column on one line without being cut,
  at every width from 390 px to 1440 px and above; names that already fit MUST keep today's size.
- **FR-008**: Game detail pages MUST NOT scroll horizontally at 390 px or 1440 px.
- **FR-009**: Game content, data, gameplay and every other page MUST stay unchanged, except
  FR-010.
- **FR-010**: The detail page's controls panel MUST keep the design's height (at most 3 rows) for
  every game; Ladrillazo's controls are regrouped into 3 rows with the same information (move with
  ← → / A D / mouse, launch and continue with Espacio, pause with P).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: After clicking a game (detail page or "▶ JUGAR"), the screen visibly changes within
  0.1 seconds, on a typical laptop, in 10 out of 10 tries.
- **SC-002**: The placeholder-to-content swap moves no visible block by more than a few pixels.
- **SC-003**: 0 non-instant navigation warnings on the detail and play pages during development.
- **SC-004**: 0 of the 12 game detail pages scroll horizontally at 390 px and at 1440 px.
- **SC-005**: Every other portal page and both pages' final content look identical to before.

## Assumptions

- Only the detail page and the play screen are in scope; other routes did not show the warning
  in feature 002's testing. If another route shows it during this work, it is noted for a later
  spec, not fixed here.
- The detail page placeholder follows the existing catalog placeholder pattern (striped blocks in
  the portal style); the play screen placeholder reuses its own "CARGANDO" look so the change into
  the real screen is seamless.
- Long titles are handled by reducing the title size just enough for the longest word to fit,
  never by breaking a word across lines; multi-word titles keep wrapping between words as today.
- Prefetching every link individually ahead of time is not used (it adds a server request per
  link); the instant response comes from the placeholder.
