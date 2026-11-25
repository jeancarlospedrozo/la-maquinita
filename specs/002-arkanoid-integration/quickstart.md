# Quickstart: validate the Arkanoid integration

**Feature**: [spec.md](./spec.md) · **Contract**: [contracts/engine.md](./contracts/engine.md)

There is no automated test suite; these are the manual checks (constitution: verify at 390 px
and 1440 px).

## Prerequisites

```bash
npm install
npm run dev            # http://localhost:3000
```

No `.env.local` is needed: this feature does not touch Supabase.

## Scenario 1 – Play the real game (US1, desktop 1440 px)

1. Open `/juegos/ladrillazo` → "Tu mejor" shows **640**; the controls box lists paleta / lanzar
   / pausa (no "escudo", no "disparar"). Press **▶ JUGAR**.
2. Loading bar fills, then "LADRILLAZO / PRESS START". Press Space once.
   - Expected: level 1 (72 bricks), ball on the paddle, notice "PULSA ESPACIO…", HUD
     `000000`, 3 lives, level `01`. The same Space did **not** launch the ball.
3. Press Space → ball launches. Move with ← →, A D and the mouse; the paddle never leaves the
   field and follows the cursor exactly at any window width.
4. Break a brick → explosion, break sound, HUD +10 at the same moment.
5. Arrow keys and Space never scroll the page.
6. Clear level 1 → notice "NIVEL 1 COMPLETADO"; Space/click continues to the pyramid with
   score and lives kept; ball visibly faster. Same for level 2 → ajedrez.

## Scenario 2 – Cabinet controls (US2)

1. During play press **P**, **Escape** and **II Pausa** in turn → everything freezes and the
   PAUSA overlay shows; **Continuar** resumes from the exact same position. Repeat 10× (SC-005).
2. Switch to another tab for 5 s and come back → game is paused, no life lost.
3. **♪ Sonido** off → no sounds; on → sounds back.
4. **⤢ Pantalla completa** → field fills the screen, 4:3, crisp pixels, mouse still aligned.
5. **↻ Reiniciar** mid-level 2 → level 1, 3 lives, 0 points.

## Scenario 3 – End of game (US3)

1. Lose all 3 balls with fewer than 640 points → **GAME OVER**, final score, "te faltaron N".
   **↻ Reintentar** → level 1, 3 lives, 0 points.
2. Score more than 640 → **¡NUEVO RÉCORD!**, enter initials, **Guardar récord** → end screen;
   "TU RÉCORD" shows the new score.
3. Clear level 3 → **¡VICTORIA!** title on the end screen (preceded by ¡NUEVO RÉCORD! if the
   score beats the best). "RÉCORD GLOBAL" shows 1.380 · luzbel.exe.

## Scenario 4 – Phone (US4, 390 px, touch emulation)

1. DevTools device mode 390×844, touch on. Open `/juegos/ladrillazo/jugar`.
2. Game area is 4:3, fully visible above the touch pad, no page scroll.
3. Pad shows only ◀ ▶ and **A** (no ▲ ▼, no B). Hold ◀/▶ → paddle moves; release → stops.
4. Drag on the game area → paddle follows; tap → launches. "Gráficos: Petraheim" is visible.

## Scenario 5 – Edge cases

1. DevTools → Network → block `spritesheet-breakout.png`, reload → Spanish error message with
   **Reintentar**; unblock, Reintentar → loads.
2. Block the two `.mp3` files → game plays silently, no error shown.
3. Leave with **← Salir** mid-game, wait, come back → fresh game; while away, no sound and no
   activity in the Performance panel.
4. Rotate/resize during play → field rescales, state kept.
5. CPU throttling 6× → ball never passes through paddle or bricks.

## Scenario 6 – Nothing else changed (FR-016, SC-008)

1. `/juegos/cometa-loca/jugar` → demo mode exactly as before (portrait slot on mobile,
   "canvas del juego · demo", original controls text and tip).
2. `/rankings` and `/` → same layout; luzbel.exe now listed under "Robo Rumba".

## Scenario 7 – Quality gates

```bash
npm run lint && npx tsc --noEmit && npm run format:check && npm run build
```

All pass; the build prerenders every `/juegos/[slug]/jugar` route.

## Scenario 8 – Language (SC-007)

Scan the play screen of Ladrillazo in every state (loading, error, start, serving notice,
level complete, pause, game over, victory, record): no English text other than the closed
list allowed by Constitution Principle I (v1.0.1): "PRESS START", "GAME OVER" and
"INSERT COIN TO CONTINUE". Any other English string, including on the "¡VICTORIA!" screen, fails.
