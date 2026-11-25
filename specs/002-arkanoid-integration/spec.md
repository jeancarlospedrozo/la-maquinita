# Feature Specification: Arkanoid Integration (first playable game)

**Feature Branch**: `002-arkanoid-integration`

**Created**: 2026-11-25

**Status**: Approved

**Input**: User description: "vamos a implementar nuestro primer juego de arkanoid que ya está creado y tenemos que adaptarlo a esta plataforma. El juego está en @references/arkanoid/"

**Scope note**: A complete brick-breaking game already exists as a standalone browser page
(`references/arkanoid/`: 3 levels, sprites, sounds, Spanish messages). This feature makes it the
portal's first real, playable game inside the existing play screen ("modo foco"), replacing the
demo simulation for that one game. Every other game in the catalog keeps the demo mode. Saving
scores to a backend, player accounts and new gameplay (power-ups, more levels) are separate,
later features.

## Clarifications

### Session 2026-11-25

- Q: ¿Cómo aparece el Arkanoid en el catálogo? → A: Se monta en la ficha existente "Ladrillazo"
  (Clásicos); ranking, torneo y favoritos ya apuntan a ella, y sus récords de ejemplo se ajustan
  al máximo real de 1 500 puntos.
- Q: En móvil, ¿pantalla vertical 3:4 del diseño u horizontal 4:3 del juego? → A: El hueco del
  juego en móvil pasa a 4:3 solo para este juego, con el juego completo y sin deformar y los
  controles táctiles debajo.
- Q: Al ganar el nivel 3, ¿qué pantalla final se ve? → A: La misma pantalla de fin de partida
  con el título "¡VICTORIA!" en lugar de "GAME OVER"; si hay récord, primero "¡NUEVO RÉCORD!".
- Q: ¿Con qué estilo se muestran los mensajes intermedios ("lanzar", "Nivel N completado")?
  → A: Como avisos con el estilo del portal (fuente pixel, colores neón) sobre el juego; el
  juego deja de dibujar sus propios textos.
- Q: Si el jugador sale de pantalla completa con Escape durante la partida, ¿qué pasa? → A: El
  navegador usa Escape para salir de pantalla completa antes de que llegue al juego, así que
  salir de pantalla completa mientras se juega pausa la partida.
- Q: En táctil, ¿cómo se distingue un toque (lanzar) de un arrastre (mover)? → A: Es toque solo
  si el dedo se movió menos de 10 px del campo de juego y estuvo apoyado menos de 300 ms; un
  arrastre nunca lanza la pelota.
- Q: ¿Qué muestra la pantalla si los gráficos no cargan? → A: "NO SE PUDO CARGAR EL JUEGO", el
  texto "Revisa tu conexión e inténtalo de nuevo." y los botones "Reintentar" (vuelve a cargar)
  y "Salir" (al detalle del juego).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Play the real game from the portal (Priority: P1)

A visitor opens the game's detail page, presses "Jugar", and lands on the play screen. After the
loading screen and "PRESS START", the real brick-breaker appears inside the cabinet: a paddle, a
ball and a wall of coloured bricks. The player moves the paddle, launches the ball, breaks bricks
and clears the three levels (muro, pirámide, ajedrez) in order, with the ball getting faster in
each level, exactly as in the original game.

**Why this priority**: This is the whole point of the feature: the portal goes from showing only
simulated games to hosting a real, playable one.

**Independent Test**: On a desktop browser, open the game's play screen, start a game and play it
through: bricks break, points are added, a lost ball costs a life, clearing a level leads to the
next one, and clearing level 3 shows the victory.

**Acceptance Scenarios**:

1. **Given** the play screen of the game is open, **When** loading finishes and the player
   starts, **Then** level 1 is shown with 72 bricks, the ball resting on the paddle, 3 lives and
   0 points.
2. **Given** the ball rests on the paddle, **When** the player presses Space or clicks/taps the
   game area, **Then** the ball is launched.
3. **Given** a game in progress, **When** the player uses the arrow keys, A/D, or moves the
   mouse over the game area, **Then** the paddle follows and never leaves the playfield.
4. **Given** the ball hits a brick, **When** the brick breaks, **Then** it plays its explosion
   animation and break sound, and the score increases by 10.
5. **Given** the last brick of level 1 or 2 is broken, **When** the level ends, **Then** a
   "Nivel N completado" notice in the portal's style is shown over the game, and the next level
   starts when the player presses Space or clicks/taps; score and lives carry over.
6. **Given** the last brick of level 3 is broken, **When** the game ends, **Then** the game moves
   straight on to the end-of-game flow titled "¡VICTORIA!" (Story 3).

---

### User Story 2 - The portal's cabinet reflects the real game (Priority: P1)

While playing, everything around the game area shows the real game, not the demo: the score
panel, the lives indicator and the level indicator update as the game changes, and the cabinet
buttons (Pausa, Sonido, Pantalla completa, Reiniciar) act on the real game.

**Why this priority**: Without this the game would feel pasted in: two scoreboards disagreeing,
or a pause button that does nothing. It is required for a coherent first release.

**Independent Test**: During a game, break a brick, lose a ball and clear a level, and check that
the portal's score, lives and level indicators change at the same moment; then try each cabinet
button.

**Acceptance Scenarios**:

1. **Given** a game in progress, **When** the score, lives or level change, **Then** the portal's
   score, lives and level indicators show the new values immediately (desktop side panels and
   mobile HUD).
2. **Given** a game in progress, **When** the player presses P, Escape or the "Pausa" button,
   **Then** the ball and paddle freeze and the "PAUSA" overlay appears; "Continuar" resumes from
   exactly the same position.
3. **Given** sound is on, **When** the player turns "Sonido" off, **Then** no bounce or break
   sounds play until it is turned back on.
4. **Given** any moment after loading, **When** the player presses "Reiniciar", **Then** a new
   game starts at level 1 with 3 lives and 0 points.
5. **Given** a game in progress, **When** the player uses "Pantalla completa", **Then** the
   cabinet fills the screen and the game stays sharp and correctly proportioned.
6. **Given** the game is shown, **When** the player looks at the controls panel and the loading
   tip, **Then** they describe this game's real controls (move, launch, pause) and mention no
   features the game does not have (e.g. "escudo", "disparar").

---

### User Story 3 - Final score, game over and personal best (Priority: P2)

When the player loses their last life or wins, the game hands its final score to the portal. The
portal shows its existing "GAME OVER" screen, or "¡NUEVO RÉCORD!" with the initials entry when
the score beats the player's best, and offers "Reintentar", which starts a fresh game at level 1.

**Why this priority**: It closes the loop with the portal's existing end-of-game screens and
personal best, but the game is already playable and valuable without it.

**Independent Test**: Lose all three lives with a low score and check GAME OVER; then beat the
shown personal best and check that the new-record screen appears and the best updates.

**Acceptance Scenarios**:

1. **Given** the player has one life left, **When** the ball falls past the paddle, **Then** the
   portal's GAME OVER screen shows the final score and the gap to the personal best.
2. **Given** the final score is higher than the personal best, **When** the game ends (by losing
   or by winning), **Then** the "¡NUEVO RÉCORD!" screen appears and saving the initials updates
   "TU RÉCORD" for the rest of the session.
3. **Given** the player clears level 3 without beating the personal best, **When** the game
   ends, **Then** the end-of-game screen is shown with the title "¡VICTORIA!" instead of
   "GAME OVER", with the same final score, personal-best line and "Reintentar" / "Salir"
   buttons. After saving a new record reached by winning, the same "¡VICTORIA!" screen follows.
4. **Given** the end-of-game screen is shown, **When** the player chooses "Reintentar", **Then** a
   new game starts at level 1 with 3 lives and 0 points.

---

### User Story 4 - Play on a phone (Priority: P3)

A visitor on a phone (390 px wide) opens the play screen and can play the whole game with touch
only.

**Why this priority**: The portal is designed mobile-first and already has a mobile play screen
with touch controls, but desktop is the primary target for a first real game.

**Independent Test**: On a 390 px-wide touch screen, start a game, move the paddle, launch the
ball and clear at least one brick without a keyboard or mouse.

**Acceptance Scenarios**:

1. **Given** the mobile play screen, **When** the game is shown, **Then** the game area switches to a
   landscape 4:3 shape for this game (instead of the design's portrait 3:4 slot), and the whole
   playfield is visible without scrolling and without distortion, with the touch controls below.
2. **Given** the ball rests on the paddle, **When** the player taps the "A" button or the game
   area, **Then** the ball is launched.
3. **Given** a game in progress, **When** the player holds the ◀ / ▶ pad buttons or drags a finger
   across the game area, **Then** the paddle moves accordingly.

---

### Edge Cases

- The player leaves the browser tab or window mid-game: the game pauses automatically and any
  held movement key is released, so the paddle does not keep sliding and the ball is not lost
  while the player is away.
- The game's graphics fail to load: the error screen of FR-019 is shown. A sound that fails to
  load never blocks play and shows no error.
- The browser blocks sound until the first interaction: the game still runs, silently, and sound
  starts working after the first click or key press, with no error shown.
- The player presses Space while the "PRESS START" overlay is shown: it starts the game once; it
  does not also launch the ball in the same press.
- Pressing arrow keys or Space while playing never scrolls the page.
- The player navigates away ("Salir") mid-game and comes back: a fresh game starts; nothing from
  the previous game keeps running in the background (no sounds, no extra CPU use).
- Very slow frames (a busy device) never let the ball pass through the paddle or bricks.
- The window is resized or rotated during a game: the playfield rescales without losing the
  game state.
- Other games in the catalog: their play screens keep working exactly as today, with the demo
  simulation.

## Requirements _(mandatory)_

### Functional Requirements

#### Gameplay (kept from the original game)

- **FR-001**: The game MUST keep the original rules: 3 levels played in order (muro 72 bricks,
  pirámide 42, ajedrez 36), ball speed rising per level (as in the original), 10 points per brick
  (1 500 maximum), 3 lives, one life lost each time the ball falls past the paddle, and score and
  lives carried over between levels.
- **FR-002**: The game MUST keep the original look and feel: sprite artwork for paddle, ball and
  bricks, brick explosion animation, bounce and break sounds, and the paddle bounce angle that
  depends on where the ball hits it.
- **FR-003**: The in-between moments of the game MUST be announced with notices in the portal's
  visual style (pixel font, neon colours, as "PRESS START" and "PAUSA"), shown over the game
  area: waiting to launch ("PULSA ESPACIO O HAZ CLIC PARA LANZAR" on desktop, "TOCA O PULSA A
  PARA LANZAR" on mobile) and "Nivel N completado" (with how to continue). The game itself MUST NOT draw any text on the playfield. Victory and game
  over are shown only by the portal's end-of-game screens (FR-006).
- **FR-004**: The artwork credit "Gráficos: Petraheim" MUST remain visible on the play screen of
  this game.

#### Integration with the play screen

- **FR-005**: The real game MUST render inside the existing play-screen game area, in place of the
  "canvas del juego" placeholder, only for the game it is assigned to (see FR-013).
- **FR-006**: The play screen's states MUST be driven by the real game: loading lasts until the
  game's graphics are ready; "PRESS START" starts a game; losing the last life leads to the
  portal's "GAME OVER" screen and clearing level 3 to the same end-of-game screen titled
  "¡VICTORIA!", both with the real final score; when the score beats the personal best, the
  "¡NUEVO RÉCORD!" screen comes first.
- **FR-007**: The score, lives and level shown by the portal (desktop side panels and mobile HUD)
  MUST always match the game's current values. The game area MUST NOT show a second, competing
  scoreboard.
- **FR-008**: Pause (button, P or Escape) MUST freeze the game completely and resume it from the
  same position; the game MUST pause automatically when the page loses focus or becomes hidden,
  and when the player leaves full screen during play (in full screen the browser uses Escape to
  exit full screen, so that Escape pauses the game this way). Resuming is only through the
  PAUSA overlay's "Continuar".
- **FR-009**: The "Sonido" toggle MUST mute and unmute all of the game's sounds.
- **FR-010**: "Reiniciar" and the end screen's "Reintentar" MUST start a fresh game at level 1 with 3 lives and
  0 points.
- **FR-011**: The playfield MUST scale to fit the available game area (desktop, mobile and full
  screen) while keeping its proportions and crisp pixel art.
- **FR-012**: The controls panel of the play screen and of the game's detail page, the loading
  tip and the touch controls' labels MUST describe only this game's real controls in Spanish
  (move with ← → / A D / mouse, launch with Espacio or clic, pause with P); unused touch buttons
  MUST be hidden for this game.

#### Catalog and data

- **FR-013**: The game MUST be offered in the catalog as the existing entry "Ladrillazo"
  (category Clásicos, the portal's brick-breaker), so its detail page, "Jugar" button, rankings
  and tournament references all lead to the real game. No new catalog entry is added.
- **FR-014**: The mock global record, rankings and personal-best values for this game MUST be
  achievable with the real scoring (at most 1 500 points), so the "¡NUEVO RÉCORD!" flow can be
  reached by playing. This game gets its own mock personal best (today one shared value,
  84.120, is shown for every game); the other games keep showing the shared value. This
  includes the game's leaderboard on its detail page: every score is at most 1 500 and the
  player's own row shows the personal best (640); the other games keep the shared leaderboard.
- **FR-015**: Saving the initials of a new record MUST keep the existing behaviour (updates the
  personal best for the session, with the existing marker for the future rankings API); no score
  is sent to a backend in this feature.
- **FR-016**: Every other game in the catalog MUST keep the current demo behaviour unchanged.

#### Controls

- **FR-017**: On desktop the game MUST be playable with keyboard (← →, A D, Espacio) and mouse
  (move to aim, click to launch/continue); pressing these keys while playing MUST NOT scroll the
  page.
- **FR-018**: On touch devices the game MUST be playable with the on-screen pad (◀ ▶ to move,
  "A" to launch/continue) and by dragging and tapping on the game area. A touch counts as a tap
  (launch/continue) only if the finger moved less than 10 px of the playfield (800 px wide) and
  stayed down less than 300 ms; a drag only moves the paddle and never launches the ball.

#### Loading errors

- **FR-019**: If the game's graphics cannot be loaded, the game area MUST show an error screen
  with the title "NO SE PUDO CARGAR EL JUEGO", the text "Revisa tu conexión e inténtalo de
  nuevo.", a "Reintentar" button that loads the graphics again (back to the loading screen) and
  a "Salir" link to the game's detail page.

### Key Entities

- **Game session**: one run from start to game over or victory. Holds current level (1–3),
  score (0–1 500), lives (0–3), and phase (waiting to launch, playing, paused, level complete,
  won, lost).
- **Level**: a brick layout (12 columns × 6 coloured rows) and a ball speed. Three fixed levels.
- **Catalog game entry**: the existing portal entry that the real game is attached to (name,
  description, record, rankings), whose mock numbers must fit the real scoring.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A visitor can go from the game's detail page to controlling the paddle in under
  10 seconds on a typical broadband connection.
- **SC-002**: A full game (all 3 levels) can be completed on desktop with keyboard only, mouse
  only, and on a 390 px touch screen with touch only.
- **SC-003**: In 100% of checked moments during play, the portal's score, lives and level
  indicators show the same values as the game.
- **SC-004**: The game runs smoothly (no visible stutter) at 60 frames per second on a
  mid-range laptop and a mid-range phone.
- **SC-005**: Pausing and resuming 10 times in a row never changes the ball's position or
  costs a life.
- **SC-006**: After leaving the play screen, no game sound plays and no game activity continues.
- **SC-007**: No English text is visible anywhere on this game's play screen, except the closed
  list of arcade terms from the reference design allowed by Constitution Principle I ("PRESS
  START", "GAME OVER", "INSERT COIN TO CONTINUE"). Every text this feature adds is in Spanish.
- **SC-008**: The play screens of all other catalog games behave exactly as before.

## Assumptions

- The reference game in `references/arkanoid/` is the source of truth for gameplay, artwork,
  sounds and rules; its sprite sheet and sounds are the team's own assets and may be shipped
  with the portal, keeping the artist credit.
- The game's trademark-style working name ("Arkanoid") is not shown to players; it appears in
  the portal under its catalog name (see FR-013).
- The portal's end-of-game screens (GAME OVER, ¡VICTORIA!, ¡NUEVO RÉCORD!) replace the original
  game's own "Game over" and "¡Victoria!" messages.
- Pause, sound toggle, full screen and restart are new for this game and come from the portal's
  cabinet; the original game had none of them.
- The personal best stays per session (mock data) as today; persisting scores, rankings and
  player accounts belongs to later features.
- The play screen stays in "modo foco" (no site navigation), as today.
- The original page's "Cargando…" text is replaced by the portal's loading screen.
- New gameplay (power-ups, more levels, resistant bricks, shield) is out of scope.
