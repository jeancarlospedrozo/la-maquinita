# Data Model: Instant navigation to game pages

**Feature**: [spec.md](./spec.md) · **Research**: [research.md](./research.md)

No new entities and no database. Two small changes to existing data and one derived value.

## 1. `GameControls.desktop` (existing, `lib/data.ts`)

| Rule           | Detail                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| At most 3 rows | The detail page layout depends on the panel's height (research R5). Checked in development only; violating it throws with a Spanish message naming the game. |

Ladrillazo's value changes from 5 rows to 3:

| Keys            | Label                        |
| --------------- | ---------------------------- |
| `←` `→` `A` `D` | Mover la paleta (o el ratón) |
| `ESPACIO`       | Lanzar · continuar           |
| `P`             | Pausa                        |

`hud`, `touch`, `tip` and `pad` are unchanged.

## 2. Title width (derived, `lib/titleFit.ts`)

| Name            | Type     | Rule                                                                                                                                                   |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `titleEm(name)` | `number` | Width in em of the longest word of `name.toUpperCase()` in Silkscreen, summing a fixed advance table (research R6); unknown characters count 0.875 em. |

Used by the detail page as the CSS variable `--title-em` on the `<h1>`:
`font-size: min(56px, 100cqi / var(--title-em))` (desktop), `min(36px, …)` (mobile).

| Game (longest word) | `titleEm` | Size at 1440 px (column 333 px) |
| ------------------- | --------- | ------------------------------- |
| LADRILLAZO          | 6.625     | ≈ 50.3 px                       |
| FANTASMÍN           | 6.5       | ≈ 51.2 px                       |
| Every other game    | ≤ 5.0     | 56 px (unchanged)               |
