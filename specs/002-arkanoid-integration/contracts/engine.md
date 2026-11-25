# Contract: Game engine ↔ play screen

**Feature**: [../spec.md](../spec.md) · **Data model**: [../data-model.md](../data-model.md)

The contract between a real game engine and the shared play screen (`GameScreen`). Ladrillazo
is the first implementation; future engines implement the same shape so `GameScreen` stays
generic.

## Factory

```ts
// lib/games/ladrillazo/index.ts
export function createLadrillazoEngine(
  canvas: HTMLCanvasElement,
  events: EngineEvents,
  options?: { assetBase?: string }, // default "/games/ladrillazo"
): EngineHandle;
```

- MUST only be called in the browser (inside an effect). Importing the module MUST have no side
  effects (no listeners, no `Audio`, no image loading at import time).
- Starts loading the sprite sheet and sounds immediately; draws nothing but a black field until
  ready.

## Events (engine → screen)

```ts
type EnginePhase =
  "idle" | "serving" | "playing" | "levelComplete" | "won" | "lost";

type EngineEvents = {
  onProgress(loaded: number, total: number): void; // asset loading, total ≥ 1
  onReady(): void; // sprite sheet ready; phase "idle"
  onError(reason: "sprites"): void; // sprite sheet failed; sounds never error
  onStats(stats: { score: number; lives: number; level: number }): void;
  onPhase(phase: EnginePhase): void;
  onEnd(result: { score: number; won: boolean }): void; // once per session, after phase won/lost
};
```

Rules:

- `onStats` fires once right after `start()`/`restart()` and then only when a value changes.
- `onEnd` fires exactly once per session; no further `onStats` until `restart()`.
- No event fires after `destroy()`.

## Commands (screen → engine)

```ts
type EngineHandle = {
  start(): void; // idle → serving (level 1, 3 lives, 0 pts). No-op before onReady.
  restart(): void; // any → serving, fresh session; clears pause.
  pause(): void; // freeze updates; held input cleared.
  resume(): void; // unfreeze; the paused interval is never simulated.
  action(): void; // serving → launch; levelComplete → next level; ignored otherwise.
  setDirection(d: -1 | 0 | 1): void; // touch-pad hold
  setMuted(muted: boolean): void;
  retryAssets(): void; // after onError: reload the sprite sheet
  destroy(): void; // cancel the loop, remove every listener, stop sounds. Idempotent.
};
```

## Input owned by the engine

| Input                        | Effect                                      | Active when                                           |
| ---------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| ← → / A D (held)             | move paddle at 600 px/s                     | started, not paused                                   |
| Space (no repeat)            | `action()`; `preventDefault`                | started, not paused, after the start key was released |
| pointer move on canvas       | centre paddle on pointer (scaled to 800 px) | started, not paused                                   |
| pointer down / tap on canvas | `action()`                                  | started, not paused                                   |
| window `blur`                | clear held keys                             | always                                                |

Owned by `GameScreen` (unchanged): P / Escape (pause), Enter/Space on "PRESS START", initials
entry keys, `visibilitychange` → pause.

## Registry (client)

```ts
// components/game/engines.ts ("use client")
export const engines: Record<
  "ladrillazo",
  { Canvas: ComponentType<EngineCanvasProps>; credit?: string }
>;

type EngineCanvasProps = {
  events: EngineEvents;
  onHandle(handle: EngineHandle | null): void; // null on unmount
};
```

`Canvas` is loaded with `next/dynamic(..., { ssr: false })`. `credit` for Ladrillazo is
"Gráficos: Petraheim".

## GameScreen props (additions)

```ts
engine?: "ladrillazo";          // from game.engine; absent ⇒ demo mode, unchanged
controls: GameControls;         // from game.controls ?? defaultControls
personalBest: string;           // now game.personalBest ?? currentPlayer.best
globalHolder: string;           // now game.recordHolder ?? top5 lookup
```
