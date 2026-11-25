# Implementation Plan: Arkanoid Integration (first playable game)

**Branch**: `002-arkanoid-integration` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-arkanoid-integration/spec.md`

## Summary

Port the standalone brick-breaker in `references/arkanoid/` to a framework-free TypeScript
engine (`lib/games/ladrillazo/`) with no import-time side effects, a factory that takes a
canvas, and a typed event/command handle. A small client component mounts it inside the
existing play-screen slot; `GameScreen` picks it from a client registry (loaded with
`next/dynamic`, `ssr: false`) when the catalog entry has `engine: "ladrillazo"`, and mirrors the
engine's score, lives, level and phase into the existing HUD, overlays, pause, sound, restart
and end screens. All in-game text moves to portal-styled overlays; the end screen gains a
"¡VICTORIA!" variant and an asset-error state. Mobile switches to a 4:3 slot with a reduced
touch pad. The Ladrillazo mock data is made achievable (record 1.380, personal best 640) and
gets per-game controls copy. Every other game keeps the demo. Details:
[research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict); Next.js 16.4.5, React 19.3 (React Compiler lint
rules)

**Primary Dependencies**: None new. Canvas 2D, `requestAnimationFrame`, `HTMLAudioElement`,
Pointer Events, Fullscreen API (already used); `next/dynamic`

**Storage**: None. Static assets in `public/games/ladrillazo/` (PNG 559×337, two MP3s, ~32 KB);
session data in memory; mock catalog in `lib/data.ts`

**Testing**: No test suite (constitution). Manual scenarios in [quickstart.md](./quickstart.md)
plus quality gates

**Target Platform**: Modern desktop and mobile browsers (keyboard, mouse, touch)

**Project Type**: Web application (single Next.js App Router project)

**Performance Goals**: 60 fps with no React render per frame; React updates only on stat or
phase changes (a few per second at most)

**Constraints**: Play route stays prerendered (engine created in an effect only); no listener,
loop or sound survives leaving the screen; logical field fixed at 800×600 so physics match the
original exactly

**Scale/Scope**: ~4 new engine modules, 2 new client files, 3 assets, changes to `GameScreen`,
the play page, the detail page and `lib/data.ts`

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                        | Assessment                                                                                                                                                                                                                                         | Status |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| I. Spanish-First Experience      | All new copy in Spanish (notices, error, victory, controls, tip, ARIA labels for the canvas and pad). Engine draws no text. Quickstart Scenario 8.                                                                                                 | PASS   |
| II. Design Fidelity              | Overlays reuse `font-pixel`, `lm-neon-pink`, `Blink`, tokens. One deliberate deviation: the mobile slot is 4:3 for engine games instead of the design's 3:4 (spec clarification Q2) — see Complexity Tracking. Reduced-motion respected (`Blink`). | PASS*  |
| III. Cache Components Compliance | No runtime data read; `generateStaticParams` unchanged; engine and `Date.now`-like timing live in effects/rAF only; bundled docs checked for `next/dynamic` `ssr:false` (lazy-loading guide) and `public/` (public-folder).                        | PASS   |
| IV. Server-First Components      | Pages stay Server Components; client additions are leaves (`LadrillazoCanvas`, `engines.ts` registry) inside the existing `GameScreen` island. Play screen stays without `SiteShell`.                                                              | PASS   |
| V. Data Behind a Seam            | New catalog fields and values live in `lib/data.ts` with `TODO` markers; saving initials keeps its `TODO` for the rankings API; no backend access.                                                                                                 | PASS   |
| Tech constraints                 | No new runtime dependency. Demo mode stays for every game without an engine, so all `GameScreen` states remain reachable; the new `error` state is additive.                                                                                       | PASS   |
| Workflow & gates                 | Feature branch `002-arkanoid-integration`; lint, tsc, format:check, build in quickstart Scenario 7; manual checks at 390/1440 px.                                                                                                                  | PASS   |

**Post-design re-check (after Phase 1)**: still PASS. The engine contract keeps React out of
the frame loop, the registry keeps `GameScreen` generic, and the only deviation (mobile 4:3) is
user-approved and scoped to engine games.

## Project Structure

### Documentation (this feature)

```text
specs/002-arkanoid-integration/
├── plan.md              # This file
├── research.md          # Phase 0 decisions (R1–R13)
├── data-model.md        # Levels, session, play-screen state, catalog fields
├── quickstart.md        # Validation scenarios 1–8
├── contracts/
│   └── engine.md        # Engine factory, events, commands, registry, GameScreen props
└── tasks.md             # Phase 2 (/speckit-tasks; not created here)
```

### Source Code (repository root)

```text
lib/
├── data.ts                         # UPDATED: Game.engine/personalBest/recordHolder/controls,
│                                   #   GameControls + defaultControls, Ladrillazo values,
│                                   #   luzbel.exe row → "Robo Rumba"
└── games/
    └── ladrillazo/                 # NEW: framework-free engine (no React, no import side effects)
        ├── levels.ts               # constants + 3 level maps (verbatim from the original)
        ├── sprites.ts              # sprite/explosion coordinates, loader, draw helpers
        ├── engine.ts               # session state, rules, loop, input, sounds
        └── index.ts                # createLadrillazoEngine + EngineEvents/EngineHandle types

components/game/
├── GameScreen.tsx                  # UPDATED: engine mode (mirror stats/phase, notices,
│                                   #   error state, ¡VICTORIA!, 4:3 mobile slot, credit,
│                                   #   per-game controls + tip, reduced TouchControls,
│                                   #   auto-pause on visibilitychange)
├── engines.ts                      # NEW ("use client"): registry, next/dynamic ssr:false
└── LadrillazoCanvas.tsx            # NEW ("use client"): <canvas>, create/destroy engine

app/juegos/[slug]/
├── jugar/page.tsx                  # UPDATED: pass engine, controls, personalBest, holder
└── page.tsx                        # UPDATED: "tu mejor" + controls panel from game data

public/games/ladrillazo/            # NEW: spritesheet-breakout.png, ball-bounce.mp3,
                                    #   break-sound.mp3 (copied from references/arkanoid/assets)

CLAUDE.md                           # UPDATED: Architecture → engines (lib/games, registry,
                                    #   contract), public/ assets
```

`references/arkanoid/` stays as the untouched source reference.

**Structure Decision**: Single Next.js project. Game logic goes in a new `lib/games/<slug>/`
folder (framework-free, like `lib/data.ts`), the React glue in the existing
`components/game/` client folder, and static assets in `public/games/<slug>/`, a layout that
the next real game can follow unchanged.

## Complexity Tracking

| Deviation                                                       | Why Needed                                                                              | Simpler Alternative Rejected Because                                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Mobile game slot 4:3 instead of the design's 3:4 (Principle II) | The game's field is landscape 800×600; user chose 4:3 in clarification Q2 (2026-11-25). | Keeping 3:4 letterboxes the field to ~60 % of the slot height, making the paddle and ball tiny on a phone. |
