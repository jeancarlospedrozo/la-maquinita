---
description: "Task list for the Arkanoid (Ladrillazo) integration"
---

# Tasks: Arkanoid Integration (first playable game)

**Input**: Design documents from `specs/002-arkanoid-integration/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/engine.md](./contracts/engine.md),
[quickstart.md](./quickstart.md)

**Tests**: Not requested (the project has no test suite). Each phase ends with the matching
manual scenario from [quickstart.md](./quickstart.md); the quality gates run in the last phase.

**Source of truth for gameplay**: `references/arkanoid/src/game.js` and
`references/arkanoid/assets/spritesheet.js`. Port logic and constants verbatim unless a task says
otherwise. Never edit `references/`.

**Organization**: Tasks are grouped by user story so each story can be implemented and checked
on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an unfinished task)
- **[Story]**: User story from spec.md (US1–US4)

---

## Phase 1: Setup

**Purpose**: Assets and folders the engine needs

- [x] T001 Copy `references/arkanoid/assets/spritesheet-breakout.png`, `references/arkanoid/assets/sounds/ball-bounce.mp3` and `references/arkanoid/assets/sounds/break-sound.mp3` unchanged into `public/games/ladrillazo/` (first use of `public/`; served at `/games/ladrillazo/...`, research R8)
- [x] T002 Create the folder `lib/games/ladrillazo/` for the framework-free engine (no React imports anywhere under `lib/games/`)

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Types, constants, data fields and the generic engine slot in `GameScreen`. No user
story can be built before this phase is done.

- [x] T003 [P] Create `lib/games/ladrillazo/levels.ts`: export the original constants (`BLOCK_COLUMNS = 12`, `BLOCK_WIDTH = 64`, `BLOCK_HEIGHT = 32`, `BLOCKS_X = 16`, `BLOCKS_Y = 60`, `PADDLE_SPEED = 600`, `LAUNCH_ANGLE = Math.PI / 6`, `MAX_BOUNCE_ANGLE = Math.PI / 3`, `BLOCK_POINTS = 10`, `MAX_DELTA = 1 / 30`, `MAX_LIVES = 3`, `FIELD_WIDTH = 800`, `FIELD_HEIGHT = 600`, paddle `{ x: 319, y: 560, w: 162, h: 14 }`, ball size `16`), `BLOCK_ROWS = ["red","hotpink","yellow","cyan","green","magenta"] as const`, and `LEVELS` with the three maps and speeds 360/420/480 copied verbatim from `references/arkanoid/src/game.js`. Add a dev-only check (`process.env.NODE_ENV !== "production"`) that every map is "Exactly 6 rows × 12 chars" so the maximum stays 1 500 points (data-model §1)
- [x] T004 [P] Create `lib/games/ladrillazo/sprites.ts`: port `SPRITES`, `EXPLOSION_FRAMES` (keep gray → red row, as in the original) and `EXPLOSION_DURATION = 150` from `references/arkanoid/assets/spritesheet.js` as typed constants; replace the global loader with `loadSpritesheet(url: string): Promise<HTMLCanvasElement>` (new `Image()`, `decode()`, copy to an offscreen canvas) and pure `drawSprite(ctx, sheet, name, x, y, w, h)` / `drawFrame(ctx, sheet, frame, x, y, w, h)` helpers. No module-level state or side effects
- [x] T005 [P] Create `lib/games/ladrillazo/index.ts` with the types from `contracts/engine.md` exactly: `EnginePhase = "idle" | "serving" | "playing" | "levelComplete" | "won" | "lost"`, `EngineEvents` (`onProgress`, `onReady`, `onError(reason: "sprites")`, `onStats`, `onPhase`, `onEnd`) and `EngineHandle` (`start`, `restart`, `pause`, `resume`, `action`, `setDirection(d: -1 | 0 | 1)`, `setMuted`, `retryAssets`, `destroy`), and re-export `createLadrillazoEngine` from `./engine` (T010)
- [x] T006 [P] Extend `lib/data.ts`: add `GameControls` type (`desktop: { keys: string[]; label: string }[]`, `touch: string`, `tip: string`, `pad: { vertical: boolean; b: boolean }`), export `defaultControls` holding today's texts unchanged (play-screen box: "← ↑ → ↓ mover", "ESPACIO disparar", "X escudo · P pausa"; detail page: arrows "Mover la nave", ESPACIO "Disparar", X/P "Escudo · Pausa"; touch "Táctil: D-pad para mover, A disparar, B escudo."; tip "Consejo: el escudo (X) se recarga recogiendo chatarra."; `pad: { vertical: true, b: true }`), and add optional fields to `Game`: `engine?: "ladrillazo"`, `personalBest?: string`, `recordHolder?: string`, `controls?: GameControls`, `leaderboard?: { name: string; score: string; me?: boolean; pos?: number }[]`. Add a `getControls(game)` helper returning `game.controls ?? defaultControls`. Keep a `TODO` marker that these values will come from the API
- [x] T007 Create `components/game/engines.ts` (`"use client"`): registry `engines: Record<"ladrillazo", { Canvas: ComponentType<EngineCanvasProps>; credit?: string }>` where `Canvas` is `dynamic(() => import("./LadrillazoCanvas"), { ssr: false })` and `credit: "Gráficos: Petraheim"`; export `EngineCanvasProps = { events: EngineEvents; onHandle(handle: EngineHandle | null): void }` (contracts/engine.md §Registry). Depends on T005
- [x] T008 Update `components/game/GameScreen.tsx` props per contracts/engine.md: add `engine?: "ladrillazo"` and `controls: GameControls`; when `engine` is set, do not start the simulated loading timer nor the demo score/lives intervals (keep them byte-for-byte for games without `engine`, FR-016). Keep an `engineRef` (`useRef<EngineHandle | null>`). Add `"error"` to the `State` union (`"loading" | "error" | "start" | "playing" | "pause" | "over" | "record"`), reachable only in engine mode
- [x] T009 Update `app/juegos/[slug]/jugar/page.tsx` to pass `engine={game.engine}`, `controls={getControls(game)}`, `personalBest={game.personalBest ?? currentPlayer.best}` and `globalHolder={game.recordHolder ?? holder}` (existing `top5` lookup stays as the fallback). Keep `generateStaticParams` and `generateMetadata` unchanged

**Checkpoint**: `npx tsc --noEmit` passes; every play screen, including Ladrillazo (no `engine`
value yet), still runs the demo exactly as before.

---

## Phase 3: User Story 1 – Play the real game from the portal (P1) 🎯 MVP

**Goal**: The real brick-breaker runs inside the Ladrillazo cabinet with the original rules,
art and sounds, and the portal HUD shows its score, lives and level.

**Independent Test**: quickstart Scenario 1 on desktop at 1440 px.

- [x] T010 [US1] Create `lib/games/ladrillazo/engine.ts` exporting `createLadrillazoEngine(canvas, events, options?: { assetBase?: string })` (default `assetBase` `"/games/ladrillazo"`). Port from `references/arkanoid/src/game.js`, as closures over one session object (data-model §2): `createBlocks`, `movePaddleTo`, `placeBallOnPaddle`, `launchBall`, `startNextLevel`, `loseLife`, `moveBall`, `overlaps`, `bounceOffPaddle`, `bounceOffBlock`, `hitBlock`, `updateExplosions`, `update`, `draw` (bricks, explosions, paddle, ball only — draw NO text, no HUD, no messages, FR-003). Session starts in phase `"idle"`. Rules: `start()` = `idle → serving` with level 1, score 0, lives 3; `action()` = `serving → playing` (launch) or `levelComplete → serving` of level + 1 with new blocks; last brick on level < 3 → `levelComplete`, on level 3 → `won`; ball lost with lives > 0 → `serving`, with 0 → `lost`; `restart()` = fresh session in `serving` from any phase, clears pause. Emit `onStats({score, lives, level})` once after `start()`/`restart()` and then only when a value changes; `onPhase` on every phase change; `onEnd({score, won})` exactly once when entering `won`/`lost`, and no further `onStats` until `restart()`
- [x] T011 [US1] In `lib/games/ladrillazo/engine.ts`, add the loop and loading: on creation start loading the sprite sheet via `loadSpritesheet(`${assetBase}/spritesheet-breakout.png`)` and the two sounds (`new Audio`, `preload = "auto"`); report `onProgress(loaded, total)` and `onReady()` when the sheet is ready (sounds never block or fail `onReady`); `onError("sprites")` if the sheet fails. Run a `requestAnimationFrame` loop that draws every frame (black clear) and calls `update(delta)` only when started and not paused, with `delta = min((time - lastTime) / 1000, MAX_DELTA)`. `playSound` resets `currentTime`, calls `play()` and swallows the rejected promise silently. `destroy()` cancels the frame, removes every listener, pauses sounds and makes all later calls and events no-ops (idempotent)
- [x] T012 [US1] In `lib/games/ladrillazo/engine.ts`, add keyboard and mouse input (contracts/engine.md §Input): `window` `keydown`/`keyup` track ←/→/A/D held keys (`ArrowLeft`, `KeyA`, `ArrowRight`, `KeyD`); Space (no `event.repeat`) calls `action()`; call `preventDefault()` for arrows and Space only while started and not paused. After `start()`, `restart()` **or any phase change**, ignore action input until the next `keyup` of Space or a new pointer press, so one Space press never triggers two actions (e.g. the Space that dismissed "PRESS START" does not launch, and the Space that continues after "Nivel N completado" does not also launch). Canvas `pointermove` (mouse) centres the paddle on the pointer with x scaled as `(clientX - rect.left) * FIELD_WIDTH / rect.width`; canvas `pointerdown` calls `action()`. `window` `blur` clears held keys
- [x] T013 [US1] Create `components/game/LadrillazoCanvas.tsx` (`"use client"`, default export, `EngineCanvasProps`): render `<canvas width={800} height={600} aria-label="Juego Ladrillazo" className="block size-full bg-black [image-rendering:pixelated]">`; in a `useEffect` create the engine with `createLadrillazoEngine(canvasRef.current, eventsRef.current)` (events read through a ref so the engine is created once), call `onHandle(handle)`, and in the cleanup call `handle.destroy()` and `onHandle(null)`
- [x] T014 [US1] In `components/game/GameScreen.tsx`, engine mode wiring: render `engines[engine].Canvas` inside the game area (`absolute inset-0`) instead of the striped placeholder and the "canvas del juego" label; drive `loading` progress from `onProgress` (scaled to the 14 segments) and go to `start` on `onReady`; `start()` calls `engineRef.current?.start()` and sets `playing`; mirror `onStats` into `score`, `lives` and a new `engineLevel` state; HUD level shows `String(engineLevel).padStart(2, "0")` instead of the demo formula (desktop "NIVEL" box and mobile "LV" text); store `onPhase` in an `enginePhase` state. Keep `onEnd` minimal for now: store `won`, set `finalScore` and go to `over` (T018 adds the title, US3 adds the record flow)
- [x] T015 [US1] In `components/game/GameScreen.tsx`, add the in-between notices for engine mode (FR-003, research R9), shown only while `state === "playing"`: `enginePhase === "serving"` → small `pointer-events-none` notice near the bottom of the game area, `Blink` + `font-pixel text-gold`, text "PULSA ESPACIO O HAZ CLIC PARA LANZAR" (`lg:` and up) / "TOCA O PULSA A PARA LANZAR" (mobile); `enginePhase === "levelComplete"` → centred `<button>` overlay with `tabIndex={-1}` and no `autoFocus` (keyboard continue is handled only by the engine's Space), `lm-neon-pink font-pixel` title "NIVEL {engineLevel} COMPLETADO" and hint "Pulsa Espacio o haz clic para continuar", whose click calls `engineRef.current?.action()`. Reuse existing tokens and `lm-*` classes only
- [x] T016 [US1] In `components/game/GameScreen.tsx`, show the artwork credit from `engines[engine].credit` ("Gráficos: Petraheim") under the game area for engine games, `font-mono text-[11px] text-muted`, visible at 390 px and 1440 px without scrolling (FR-004)
- [x] T017 [US1] In `lib/data.ts`, set `engine: "ladrillazo"` on the Ladrillazo game entry so its play screen mounts the real engine (FR-013)
- [x] T018 [US1] In `components/game/GameScreen.tsx`, add a `won` state (set from `onEnd`, always `false` in demo mode, reset on restart) and in the `Overlay` `over` case, when `won` is true, show the title "¡VICTORIA!" instead of "GAME OVER", `font-pixel text-lime` with `textShadow: "0 0 8px #39FF14,0 0 30px rgba(57,255,20,.7)"` and the same sizes; the rest of the end screen is unchanged (FR-006, clarification Q3)

**Checkpoint**: quickstart Scenario 1 passes, and clearing level 3 shows ¡VICTORIA! (the
¡NUEVO RÉCORD! flow comes with US3). Other games still run the demo (Scenario 6.1).

---

## Phase 4: User Story 2 – The cabinet reflects the real game (P1)

**Goal**: Pause, sound, full screen and restart act on the real game, and the controls copy
describes only this game.

**Independent Test**: quickstart Scenario 2.

- [x] T019 [US2] In `lib/games/ladrillazo/engine.ts`, implement `pause()` (set `paused`, clear held keys and touch direction) and `resume()` (clear `paused` and reset `lastTime` to `null` so the paused interval is never simulated, research R6) and `setMuted(muted)` (when true `playSound` does nothing)
- [x] T020 [US2] In `components/game/GameScreen.tsx`, connect the cabinet to the engine in engine mode: `togglePause` calls `pause()`/`resume()`; the sound toggle calls `setMuted(!sound)` (also on engine ready, so the initial state applies); "↻ Reiniciar" and the pause overlay's "Reiniciar" call `restart()`, set the state to `playing` from any state (including `start`), reset `won` and the HUD to level 1, 3 lives, 0 points (FR-010)
- [x] T021 [US2] In `components/game/GameScreen.tsx`, auto-pause (FR-008): while `state === "playing"`, `document` `visibilitychange` to `hidden` and `window` `blur` switch to `pause` (and call `engine.pause()`); resuming is only through the PAUSA overlay. Also pause on `fullscreenchange` when leaving full screen during play, because the browser uses Escape to exit full screen before the page sees it (FR-008)
- [x] T022 [US2] In `components/game/GameScreen.tsx`, make full screen keep the field correctly proportioned: in full screen the game area stays 4:3, centred, letterboxed on black, with the canvas scaled by CSS only (FR-011); pointer mapping relies on T012's scale factor
- [x] T023 [P] [US2] In `lib/data.ts`, add Ladrillazo `controls` (data-model §4): `desktop` rows in order `{ keys: ["←", "→"], label: "Mover la paleta" }`, `{ keys: ["A", "D"], label: "También mueven la paleta" }`, `{ keys: ["ESPACIO"], label: "Lanzar · continuar" }`, `{ keys: ["P"], label: "Pausa" }`, `{ keys: [], label: "También con el ratón" }`; `touch: "Táctil: ◀ ▶ o arrastra para mover, A o toca para lanzar."`; `tip: "Consejo: el borde de la paleta desvía más la pelota."`; `pad: { vertical: false, b: false }`
- [x] T024 [US2] In `components/game/GameScreen.tsx`, render the right-hand "CONTROLES" box from `controls.desktop` and the loading-screen tip from `controls.tip` (FR-012); for `defaultControls` the output must be identical to today's
- [x] T025 [P] [US2] In `app/juegos/[slug]/page.tsx`, render the desktop "CONTROLES" panel rows from `getControls(game).desktop` (keeping the existing `Key` styling and colours by row) and the mobile sentence from `getControls(game).touch`; for games without `controls` the output must be identical to today's (FR-012, research R11)

**Checkpoint**: quickstart Scenario 2 passes.

---

## Phase 5: User Story 3 – Final score, game over and personal best (P2)

**Goal**: Losing or winning hands the real score to the portal's end screens, with the new
record flow and achievable records.

**Independent Test**: quickstart Scenario 3.

- [x] T026 [US3] In `components/game/GameScreen.tsx`, route `onEnd({ score, won })` through the existing `endGame` path: set `finalScore` and `won`, go to `record` when `score > best`, else `over`; after "Guardar récord" from a winning game the `over` screen shows "¡VICTORIA!" (T018). `saveRecord` keeps its current behaviour and its `TODO` for the rankings API (FR-015). "↻ Reintentar" on the end screen calls `restart()` in engine mode and resets `won`
- [x] T027 [P] [US3] In `lib/data.ts`, update the Ladrillazo entry: `record: "1.380"`, `recordHolder: "luzbel.exe"`, `personalBest: "640"`, and rewrite `description` (Spanish) to describe the real game — three levels (muro, pirámide y ajedrez), a faster ball each level, 3 vidas — removing "bola múltiple, láser y ladrillos que contraatacan". Keep `TODO` markers for the rankings API
- [x] T028 [US3] In `lib/data.ts`, reassign the luzbel.exe rows in `top5` and `podium` (score 742.110, currently `game: "Ladrillazo"`) to `game: "Robo Rumba"`, keeping name, initials, score, short value, position and colours (data-model §4 Cross-game boards)
- [x] T029 [US3] Give Ladrillazo its own detail-page leaderboard (FR-014, data-model §4 Ladrillazo leaderboard): in `lib/data.ts` add to the Ladrillazo entry `leaderboard` = luzbel.exe 1.380, nia.pix 1.290, vector_v 1.170, tuki 1.050, raydo 960, "pixel_pao (tú)" 640 (`me: true`, `pos: 38`), quark 610, m0nch1 580; in `components/detail/DetailClient.tsx` make `GameLeaderboard` take a `rows` prop instead of importing `gameLeaderboard`; in `app/juegos/[slug]/page.tsx` pass `rows={game.leaderboard ?? gameLeaderboard}` to both `GameLeaderboard` usages. Other games keep the shared leaderboard unchanged
- [x] T030 [US3] In `app/juegos/[slug]/page.tsx`, show "tu mejor" as `game.personalBest ?? currentPlayer.best` (other games keep 84.120)

**Checkpoint**: quickstart Scenario 3 and Scenarios 6.2–6.3 pass.

---

## Phase 6: User Story 4 – Play on a phone (P3)

**Goal**: The whole game is playable with touch only at 390 px.

**Independent Test**: quickstart Scenario 4.

- [x] T031 [US4] In `components/game/GameScreen.tsx`, when `engine` is set, the game area uses `aspect-[4/3]` on mobile as well (desktop is already 4:3); demo games keep `aspect-[3/4]` on mobile (clarification Q2, plan Complexity Tracking)
- [x] T032 [US4] In `lib/games/ladrillazo/engine.ts`, add touch input: set `touch-action: none` on the canvas; for `pointerType === "touch"`, `pointermove` while pressed moves the paddle (same scaling as T012) and a release counts as a tap → `action()` only if the pointer moved less than 10 logical px and was down less than 300 ms (a drag never launches, FR-018); implement `setDirection(d)` so a held direction moves the paddle at `PADDLE_SPEED`, merged with keyboard input
- [x] T033 [US4] In `components/game/GameScreen.tsx` `TouchControls`, accept `pad: GameControls["pad"]` and engine callbacks: hide ▲/▼ when `pad.vertical` is false and "B" when `pad.b` is false (FR-012: hidden, not disabled); in engine mode ◀/▶ call `setDirection(-1|1)` on `pointerdown` and `setDirection(0)` on `pointerup`, `pointercancel` and `pointerleave`; "A" starts the game from `start` and otherwise calls `action()`. Spanish `aria-label`s: "Izquierda", "Derecha", "A · lanzar". Demo games keep the current pad unchanged

**Checkpoint**: quickstart Scenario 4 passes at 390×844 with touch emulation.

---

## Phase 7: Polish & cross-cutting concerns

- [x] T034 In `components/game/GameScreen.tsx`, add the `error` overlay (engine mode, on `onError("sprites")`): Spanish title "NO SE PUDO CARGAR EL JUEGO", text "Revisa tu conexión e inténtalo de nuevo.", a `lm-btn-primary` button "Reintentar" that calls `retryAssets()` and returns to `loading`, and a "Salir" link to `/juegos/${slug}` (FR-019, research R4)
- [x] T035 In `lib/games/ladrillazo/engine.ts`, implement `retryAssets()`: reload the sprite sheet after an `onError` and report progress/ready again
- [x] T036 [P] Update `CLAUDE.md` Architecture: real engines live in `lib/games/<slug>/` (framework-free, created in an effect, `destroy()` on unmount), are registered in `components/game/engines.ts` via `next/dynamic` `ssr: false`, follow `specs/002-arkanoid-integration/contracts/engine.md`, and serve assets from `public/games/<slug>/`; note that `GameScreen` keeps the demo for games without `engine`
- [x] T037 Remove the Sync Impact Report HTML comment at the top of `.specify/memory/constitution.md` before committing (constitution v1.0.1 amendment)
- [x] T038 Run the quality gates: `npm run lint`, `npx tsc --noEmit`, `npm run format:check`, `npm run build` (every `/juegos/[slug]/jugar` route must still prerender); fix any failure without suppressions
- [x] T039 Run quickstart Scenarios 1–8 at 390 px and 1440 px, including Scenario 5 (blocked assets, leaving mid-game, resize, CPU throttling, and 5.6 smoothness for SC-004) and Scenario 8 (only the allowed arcade terms in English), and note any failure as a follow-up task

---

## Dependencies & execution order

### Phase dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → user stories.
- **US1 (Phase 3)** depends on Phase 2. It is the MVP and the base for every other story,
  because US2–US4 extend the engine and wiring created in T010–T014.
- **US2 (Phase 4)**, **US3 (Phase 5)** and **US4 (Phase 6)** depend on US1. After US1 they are
  independent of each other in behaviour, but they share `GameScreen.tsx`, `engine.ts` and
  `lib/data.ts`, so tasks touching the same file run one after another.
- **Polish (Phase 7)** after the stories you want to ship.

### Within phases

- T003, T004, T005, T006 touch different files → parallel. T007 needs T005; T008 needs T005–T007;
  T009 needs T006 and T008.
- US1: T010 → T011 → T012 (same file); T013 needs T011; T014 needs T007, T013; T015, T016, T018
  after T014 (same file); T017 any time after T014.
- US2: T019 before T020; T023 [P] and T025 [P] are independent of the `GameScreen` tasks.
- US3: T026 after T018. T027, T028 and T029 all edit `lib/data.ts`, so run them one after the
  other; T029 and T030 both edit `app/juegos/[slug]/page.tsx`, so T030 after T029.
- US4: T032 (engine) parallel with T031 (GameScreen); T033 after T031.

### Parallel examples

```text
Phase 2:  T003 levels.ts | T004 sprites.ts | T005 index.ts | T006 data.ts
US2:      T019 engine.ts | T023 data.ts | T025 detail page
US3:      T026 GameScreen.tsx | T027 → T028 → T029 data.ts + detail | T030 after T029
US4:      T031 GameScreen.tsx | T032 engine.ts
```

## Implementation strategy

1. **MVP**: Phases 1–3 (T001–T018). Ladrillazo is playable on desktop with the real engine, a
   synced HUD and the ¡VICTORIA! ending; stop and run quickstart Scenario 1 and Scenario 6.1.
2. **Coherent cabinet**: Phase 4 (US2) — pause, sound, restart, full screen, correct controls.
   Together with the MVP this covers both P1 stories and is the minimum worth merging.
3. **End-of-game loop**: Phase 5 (US3) — ¡NUEVO RÉCORD!, records and leaderboard within reach.
4. **Mobile**: Phase 6 (US4).
5. **Polish**: Phase 7, then open the PR (constitution amendment included).
