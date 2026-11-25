# Data Model: Arkanoid Integration

**Feature**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

No database tables. Two kinds of data: the in-memory game session owned by the engine, and the
catalog fields added to the mock data in `lib/data.ts`.

---

## 1. Level (static, `lib/games/ladrillazo/levels.ts`)

| Field       | Type       | Rules                                                            |
| ----------- | ---------- | ---------------------------------------------------------------- |
| `ballSpeed` | `number`   | px/s in the 800×600 logical field. Level 1: 360, 2: 420, 3: 480. |
| `map`       | `string[]` | Exactly 6 rows × 12 chars; `X` = brick, `.` = empty.             |

Fixed list of 3 levels copied verbatim from the original (`muro` 72 bricks, `pirámide` 42,
`ajedrez` 36). Row colours top→bottom: `red, hotpink, yellow, cyan, green, magenta`.

Constants kept from the original: `BLOCK_COLUMNS 12`, brick `64×32`, field origin `(16, 60)`,
paddle `162×14` at `y 560`, ball `16×16`, `PADDLE_SPEED 600`, `LAUNCH_ANGLE π/6`,
`MAX_BOUNCE_ANGLE π/3`, `BLOCK_POINTS 10`, `MAX_DELTA 1/30`, `MAX_LIVES 3`,
`EXPLOSION_DURATION 150 ms`, 4 explosion frames per colour.

Validation: a module-level check (dev only) that every map has 6 × 12 cells, so the maximum
score stays 1 500 (`(72 + 42 + 36) × 10`).

## 2. Game session (runtime, inside the engine)

| Field        | Type                                                                     | Rules                                                |
| ------------ | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| `phase`      | `"idle" \| "serving" \| "playing" \| "levelComplete" \| "won" \| "lost"` | `idle` until `start()`; see transitions.             |
| `paused`     | `boolean`                                                                | When true, `update()` is skipped; drawing continues. |
| `level`      | `1 \| 2 \| 3`                                                            |                                                      |
| `score`      | `number`                                                                 | 0–1 500, +10 per brick.                              |
| `lives`      | `number`                                                                 | 0–3.                                                 |
| `paddle`     | `{x, y, w, h}`                                                           | `0 ≤ x ≤ 800 − w`.                                   |
| `ball`       | `{x, y, size, vx, vy}`                                                   | Rests on the paddle unless `phase = playing`.        |
| `blocks`     | `{x, y, w, h, color, alive}[]`                                           | Rebuilt from the level map on level start.           |
| `explosions` | `{x, y, color, elapsed}[]`                                               | Removed after 150 ms.                                |
| `muted`      | `boolean`                                                                | Mirrors the portal's "Sonido" toggle.                |
| `direction`  | `-1 \| 0 \| 1`                                                           | Held touch-pad direction, merged with keyboard.      |

### Phase transitions

```text
idle ──start()──▶ serving ──action()──▶ playing
                    ▲                     │ ball lost, lives > 0 → serving (lives − 1)
                    │                     │ ball lost, lives = 0 → lost        ──▶ onEnd(score, won=false)
                    │                     │ last brick, level < 3 → levelComplete
                    │                     │ last brick, level = 3 → won        ──▶ onEnd(score, won=true)
                    └──action()── levelComplete (level + 1, new blocks)
any phase ──restart()──▶ serving (level 1, score 0, lives 3)
pause()/resume() toggle `paused` without changing `phase`
```

Every change of `score`, `lives` or `level` emits `onStats`; every change of `phase` emits
`onPhase` (see [contracts/engine.md](./contracts/engine.md)).

## 3. Portal play-screen state (`components/game/GameScreen.tsx`)

Existing `State` gains one value and the end screen gains one flag:

| Change            | Detail                                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `State` + `error` | `"loading" \| "error" \| "start" \| "playing" \| "pause" \| "over" \| "record"`. Only reachable for engine games (sprite sheet failed). "Reintentar" goes back to `loading`. |
| `won: boolean`    | Set from `onEnd`; the `over` overlay shows "¡VICTORIA!" instead of "GAME OVER". Always `false` in demo mode.                                                                 |
| `enginePhase`     | Last `onPhase` value, used only to show the "lanzar" / "Nivel N completado" notices.                                                                                         |
| `level`           | For engine games, the HUD level is the engine's level (`01`–`03`) instead of the demo formula.                                                                               |

## 4. Catalog additions (`lib/data.ts`)

### `Game` (existing type, new optional fields)

| Field          | Type                                                            | Rules                                                                              |
| -------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `engine`       | `"ladrillazo"`                                                  | Optional. Present ⇒ the play screen mounts the real engine.                        |
| `personalBest` | `string`                                                        | Optional, formatted like `record` ("640"). Fallback: `currentPlayer.best`.         |
| `recordHolder` | `string`                                                        | Optional. Fallback: the `top5` lookup used today, then `"kaiser_88"`.              |
| `controls`     | `GameControls`                                                  | Optional. Fallback: `defaultControls` (today's text, unchanged).                   |
| `leaderboard`  | `{ name: string; score: string; me?: boolean; pos?: number }[]` | Optional, same shape as `gameLeaderboard`. Fallback: the shared `gameLeaderboard`. |

### `GameControls` (new type)

| Field     | Type                                  | Rules                                                                                                                                                          |
| --------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `desktop` | `{ keys: string[]; label: string }[]` | Rows of the detail page's "CONTROLES" panel.                                                                                                                   |
| `hud`     | `string[]`                            | Short lines of the play screen's "CONTROLES" box (added during implementation: today the two screens use different texts, and demo games must stay identical). |
| `touch`   | `string`                              | Sentence for the mobile detail page.                                                                                                                           |
| `tip`     | `string`                              | Loading-screen tip.                                                                                                                                            |
| `pad`     | `{ vertical: boolean; b: boolean }`   | Which touch-pad buttons are shown (▲▼, "B").                                                                                                                   |

Ladrillazo values:

- `desktop` rows, in order: `["←","→"]` "Mover la paleta"; `["A","D"]` "También mueven la
  paleta"; `["ESPACIO"]` "Lanzar · continuar"; `["P"]` "Pausa"; `[]` "También con el ratón".
- `hud`: "← → · A D mover", "RATÓN mover · CLIC lanzar", "ESPACIO lanzar · P pausa".
- `touch`: "Táctil: ◀ ▶ o arrastra para mover, A o toca para lanzar."
- `tip`: "Consejo: el borde de la paleta desvía más la pelota."
- `pad`: `{ vertical: false, b: false }`.

### Ladrillazo entry: value changes

| Field          | Before                                       | After                                                                       |
| -------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| `record`       | `742.110`                                    | `1.380`                                                                     |
| `recordHolder` | (from `top5`: luzbel.exe)                    | `luzbel.exe`                                                                |
| `personalBest` | (shared `84.120`)                            | `640`                                                                       |
| `description`  | "…power-ups modernos: bola múltiple, láser…" | Describes 3 levels (muro, pirámide, ajedrez) and faster ball; no power-ups. |
| `engine`       | —                                            | `"ladrillazo"`                                                              |

### Cross-game boards

`top5[1]` and `podium[0]` (luzbel.exe, 742.110, "Ladrillazo") are reassigned to game
"Robo Rumba" with the same score, name and position. No other ranking row references
Ladrillazo.

### Ladrillazo leaderboard (detail page)

`leaderboard`: luzbel.exe 1.380 · nia.pix 1.290 · vector_v 1.170 · tuki 1.050 · raydo 960 ·
"pixel_pao (tú)" 640 (`me: true`, `pos: 38`) · quark 610 · m0nch1 580. All ≤ 1 500; the first
row matches `record` and `recordHolder`, the player's row matches `personalBest`.
