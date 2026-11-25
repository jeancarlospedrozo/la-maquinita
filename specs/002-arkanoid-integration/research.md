# Research: Arkanoid Integration

**Feature**: [spec.md](./spec.md) · **Plan**: [plan.md](./plan.md) · **Date**: 2026-11-25

Source game analysed: `references/arkanoid/` (`index.html`, `src/game.js` ~340 lines,
`assets/spritesheet.js`, `assets/spritesheet-breakout.png` 559×337, two MP3 effects). It is a
plain-script game: globals shared between two classic `<script>` tags, a single mutable `state`
object, a `requestAnimationFrame` loop, window-level input listeners and canvas text for HUD
and messages.

---

## R1. How the game code enters the portal

- **Decision**: Port the game to TypeScript as a framework-free engine under
  `lib/games/ladrillazo/`, split in four modules: `levels.ts` (constants and the 3 maps),
  `sprites.ts` (sprite coordinates + loader), `engine.ts` (state, rules, loop, input, sound) and
  a typed public API (`createLadrillazoEngine`). React only mounts it.
- **Rationale**: The original relies on globals (`SPRITES`, `drawSprite`, `state`) and
  module-level side effects (listeners, `new Audio`, `loadSpritesheet` at load time). Those break
  under SSR/prerender (no `window`), leak across client navigations, and cannot be instantiated
  twice. A factory that receives the canvas and returns a handle with `destroy()` fixes all three
  while keeping the gameplay code almost line-for-line, which protects FR-001/FR-002 fidelity.
- **Alternatives considered**:
  - _Embed the original `index.html` in an `<iframe>` from `public/`_: zero porting, but HUD,
    pause, sound, notices and end screens would need a `postMessage` bridge, the canvas text
    would duplicate the portal HUD (FR-007) and the game's fonts would break Design Fidelity.
  - _Load `game.js` with `next/script`_: still globals and load-time side effects; cannot be
    torn down on navigation (SC-006).
  - _Rewrite in React state_: per-frame React renders for 60 fps physics is wasteful and
    diverges from the original logic.

## R2. Where the engine lives in the component tree

- **Decision**: A small client component `components/game/LadrillazoCanvas.tsx` owns the
  `<canvas>`, creates the engine in an effect and destroys it in the cleanup. `GameScreen`
  receives an optional `engine` key (a string, e.g. `"ladrillazo"`) from the server page and
  picks the component from a client-side registry (`components/game/engines.ts`) using
  `next/dynamic` with `ssr: false`, so the engine code and its assets are only loaded on that
  game's play screen.
- **Rationale**: Server Components cannot pass functions or classes to Client Components, so
  the page passes a serialisable key. The registry keeps `GameScreen` generic: games without
  an engine key keep the demo (FR-016, constitution "demo modes MUST keep every state
  reachable").
- **Alternatives considered**: branching on `slug === "ladrillazo"` inside `GameScreen` (couples
  the shared screen to one game); a separate play route for this game (duplicates the whole
  cabinet and breaks "one tree").

## R3. Engine ↔ GameScreen communication

- **Decision**: Imperative handle + event callbacks, defined in
  [contracts/engine.md](./contracts/engine.md). The engine pushes `onReady`, `onError`,
  `onStats({score, lives, level})`, `onPhase(phase)` and `onEnd({score, won})`; `GameScreen`
  calls `start()`, `pause()`, `resume()`, `restart()`, `setMuted()`, `setDirection()` and
  `action()`. Stats are emitted only when a value changes, never per frame.
- **Rationale**: Keeps React out of the 60 fps loop (SC-004) while guaranteeing the portal HUD
  shows the same values at the same moment (SC-003): the engine is the single source of truth
  and GameScreen mirrors it. With the engine attached, the demo timers are not started.
- **Alternatives considered**: a shared store read via `useSyncExternalStore` (more machinery
  for 3 numbers); polling engine state on an interval (lag, violates SC-003).

## R4. Phase mapping between the game and the portal

- **Decision**: The engine phases are `serving | playing | levelComplete | won | lost`
  (as in the original) plus a frozen flag for pause. Mapping:

  | Portal `GameScreen` state | Engine                                                |
  | ------------------------- | ----------------------------------------------------- |
  | `loading`                 | sprite sheet loading (real progress)                  |
  | `error` (new)             | sprite sheet failed to load                           |
  | `start`                   | engine ready, drawn but not started                   |
  | `playing`                 | `start()` called; phase serving/playing/levelComplete |
  | `pause`                   | `pause()`; loop keeps drawing, stops updating         |
  | `over` / `record`         | `onEnd` received (`won` false or true)                |

  `won`/`lost` are terminal inside the engine; leaving them is always `restart()` from the
  portal ("Reintentar"/"Reiniciar"), so the original "press Space to play again" is dropped.

- **Rationale**: Reuses the existing state machine; only the `error` state and a `won` flag on
  the end screens are new (spec clarifications Q3, edge case "sprite sheet fails").
- **Alternatives considered**: letting the engine keep its own end messages (contradicts the
  clarified FR-003/FR-006).

## R5. Rendering, scaling and pointer mapping

- **Decision**: Keep the logical playfield at 800×600 (canvas `width`/`height` attributes) so
  all physics constants stay identical; scale it with CSS to fill the slot (`w-full h-full`,
  `object-fit: contain` behaviour via the 4:3 slot) and `image-rendering: pixelated`. Pointer
  coordinates are converted with `(clientX - rect.left) * 800 / rect.width`. The game area gets
  `aspect-[4/3]` on mobile too when an engine is attached (clarification Q2); desktop is already
  4:3. The canvas background is black inside the existing dark bezel; the striped placeholder
  and "canvas del juego" label are hidden for engine games.
- **Rationale**: The original maps the mouse with no scale factor, which breaks as soon as the
  canvas is not 800 px wide (every portal layout). Fixed logical resolution avoids re-tuning
  speeds and makes full screen (FR-011) a pure CSS concern.
- **Alternatives considered**: resizing the canvas backing store to the device pixel size and
  scaling the world (more code, risks drift from original physics); HiDPI backing store
  (unnecessary for 16-bit pixel art drawn with smoothing off).

## R6. Game loop timing and the "tunnelling" edge case

- **Decision**: Keep the original `requestAnimationFrame` loop with `delta` clamped to 1/30 s
  (`MAX_DELTA`). The first frame after `resume()` or after the tab becomes visible resets
  `lastTime` so the paused interval is never simulated.
- **Rationale**: At 480 px/s × 1/30 s the ball moves 16 px per step, equal to its own size and
  below the paddle (14 px tall) + brick (32 px) thickness, so it cannot skip through them;
  this already satisfies the "slow frames" edge case without sub-stepping. Resetting
  `lastTime` satisfies SC-005 (pause never moves the ball).
- **Alternatives considered**: fixed-step accumulator with sub-steps (only needed above
  ~480 px/s).

## R7. Input: keyboard, mouse, touch and the double-Space case

- **Decision**:
  - Keyboard listeners are attached to `window` by the engine while it exists; Space/arrows
    call `preventDefault()` only when the engine is started and not paused (so pause-menu
    buttons and the initials entry keep working). P/Escape stay in `GameScreen`.
  - The Space that starts the game from "PRESS START" must not also launch the ball: the engine
    ignores action input until the first `keyup` or the next pointer press after `start()`.
  - Mouse: `pointermove` on the canvas moves the paddle (original used `window` mousemove;
    narrowing to the canvas avoids moving the paddle while using the side panels).
    `pointerdown` on the canvas = action.
  - Touch: the canvas uses `touch-action: none`; dragging sets the paddle position, a tap is
    the action. `TouchControls` gets props for this game: ◀/▶ call `setDirection(-1|1)` on
    `pointerdown` and `setDirection(0)` on `pointerup/cancel/leave`; "A" calls `action()`;
    ▲/▼ and "B" are hidden (FR-012).
  - `blur`, `visibilitychange: hidden` → clear held keys and `GameScreen` switches to `pause`
    (FR-008).
- **Rationale**: Covers FR-017/FR-018 and the edge cases ("arrow keys never scroll the page",
  "leaving the tab", "Space at PRESS START").
- **Alternatives considered**: routing all keys through `GameScreen` and forwarding (adds a
  React hop to every key press, no benefit).

## R8. Assets and sound

- **Decision**: Copy `spritesheet-breakout.png`, `ball-bounce.mp3` and `break-sound.mp3` to
  `public/games/ladrillazo/` (first use of `public/`; served at `/games/ladrillazo/...`). The
  sprite sheet is loaded with `new Image()` + `decode()` and copied to an offscreen canvas as
  in the original; load progress drives the existing 14-segment bar (0 → 14 on success).
  Sounds use one `HTMLAudioElement` per effect with `preload="auto"`; `play()` rejections
  (autoplay policy, missing file) are swallowed silently; `setMuted(true)` skips `play()`.
  Missing sounds never block `onReady`.
- **Rationale**: Static files in `public/` are the documented way to serve files by URL
  (bundled docs: `public-folder.md`); `next/image` does not apply to canvas drawing. The 32 KB
  of assets does not justify a new audio dependency (constitution: prefer platform features).
- **Alternatives considered**: importing the PNG as a static module (gives a hashed URL, but the
  MP3s need a loader config anyway; keeping all three in `public/` is simpler); Web Audio API
  (lower latency, more code; not needed for two short effects).

## R9. Visual style of in-game notices and end screens

- **Decision**: The engine draws no text (FR-003). `GameScreen` renders:
  - `serving`: a small, non-blocking notice near the bottom of the game area
    (`font-pixel`, `text-gold`, `Blink`): "PULSA ESPACIO O TOCA PARA LANZAR" (desktop shows
    "Espacio o clic", mobile "Toca o pulsa A").
  - `levelComplete`: a centred notice "NIVEL N COMPLETADO" (`lm-neon-pink` style title) with
    a hint to continue; clicking/tapping it calls `action()`.
  - End screens: the existing `over` overlay gains a `won` flag; when true the title is
    "¡VICTORIA!" in `text-lime` with the matching glow, the rest unchanged; `record` precedes
    it when the score beats the best (clarification Q3).
  - Notices use `pointer-events-none` except the level-complete button, so the paddle can still
    be aimed while "serving".
- **Rationale**: Clarification Q4 and Principle II (reuse `lm-*` classes and tokens).

## R10. Catalog data that must change

- **Decision** (all in `lib/data.ts`, the data seam):
  - `Game` gets three optional fields: `engine?: "ladrillazo"`, `personalBest?: string`,
    `recordHolder?: string`, and `controls?: GameControls` (see data model).
  - Ladrillazo: `engine: "ladrillazo"`, `record: "1.380"`, `recordHolder: "luzbel.exe"`,
    `personalBest: "640"`, tagline/description rewritten to match the real game (3 levels, no
    power-ups: the current text promises "bola múltiple, láser…").
  - Cross-game boards (`top5`, `podium`) list luzbel.exe with 742.110 on Ladrillazo, which is
    impossible now. That entry is reassigned to another game ("Robo Rumba") keeping name,
    score and position, so the rankings design is unchanged.
  - The play page and detail page read `game.personalBest ?? currentPlayer.best` and
    `game.recordHolder ?? top5 lookup`. Other games keep showing the shared values (FR-014).
  - The tournament "Copa Ladrillazo" has no scores; unchanged.
- **Rationale**: FR-013/FR-014 with the smallest change that keeps every other screen as is.
  Every new value keeps its `TODO` marker for the future rankings API (Principle V).

## R11. Per-game controls copy

- **Decision**: A `controls` description per game (`GameControls`: desktop list of key/label
  pairs, a touch sentence, a loading tip). Ladrillazo defines its own; games without it fall
  back to today's text, extracted unchanged into a default constant. The play screen's
  "CONTROLES" box and loading tip read it (FR-012); the detail page's controls panel reads the
  same data so the game's detail page also stops promising "escudo" and "disparar".
- **Rationale**: One definition, two screens; the detail page fix is a by-product of FR-012
  costing one prop and is listed in the plan so reviewers can see it.

## R12. Credit for the artwork

- **Decision**: For engine games, `GameScreen` shows "Gráficos: Petraheim" under the game area
  (`font-mono text-[11px] text-muted`), taken from an optional `credit` string in the engine
  registry entry.
- **Rationale**: FR-004 and the sprite sheet's licence note ("Credits Appreciated").

## R13. Next.js specifics checked in the bundled docs

- `next/dynamic` with `ssr: false` must be called from a Client Component (it is, in
  `engines.ts` marked `"use client"`).
- Files in `public/` are served from `/` with `Cache-Control: public, max-age=0`
  (`public-folder.md`); acceptable for 32 KB.
- The play route keeps `generateStaticParams`; the engine never runs during prerender because
  it is created inside an effect. No runtime data is read, so no new Suspense boundary.
