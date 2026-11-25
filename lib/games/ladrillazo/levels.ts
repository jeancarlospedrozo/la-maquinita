// Constantes y niveles de Ladrillazo, copiados tal cual del juego original
// (references/arkanoid/src/game.js). Todas las medidas están en el campo lógico de 800×600.

export const FIELD_WIDTH = 800;
export const FIELD_HEIGHT = 600;

export const BLOCK_COLUMNS = 12;
export const BLOCK_ROWS = [
  "red",
  "hotpink",
  "yellow",
  "cyan",
  "green",
  "magenta",
] as const;
export type BlockColor = (typeof BLOCK_ROWS)[number];

export const BLOCK_WIDTH = 64;
export const BLOCK_HEIGHT = 32;
export const BLOCKS_X = 16;
export const BLOCKS_Y = 60;

export const PADDLE = { x: 319, y: 560, w: 162, h: 14 } as const;
export const BALL_SIZE = 16;

export const PADDLE_SPEED = 600;
export const LAUNCH_ANGLE = Math.PI / 6;
export const MAX_BOUNCE_ANGLE = Math.PI / 3;
export const BLOCK_POINTS = 10;
export const MAX_DELTA = 1 / 30;
export const MAX_LIVES = 3;

export type Level = { ballSpeed: number; map: readonly string[] };

export const LEVELS: readonly Level[] = [
  {
    // Muro: 72 bloques
    ballSpeed: 360,
    map: [
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
      "XXXXXXXXXXXX",
    ],
  },
  {
    // Pirámide: 42 bloques
    ballSpeed: 420,
    map: [
      ".....XX.....",
      "....XXXX....",
      "...XXXXXX...",
      "..XXXXXXXX..",
      ".XXXXXXXXXX.",
      "XXXXXXXXXXXX",
    ],
  },
  {
    // Ajedrez: 36 bloques
    ballSpeed: 480,
    map: [
      "X.X.X.X.X.X.",
      ".X.X.X.X.X.X",
      "X.X.X.X.X.X.",
      ".X.X.X.X.X.X",
      "X.X.X.X.X.X.",
      ".X.X.X.X.X.X",
    ],
  },
];

if (process.env.NODE_ENV !== "production") {
  for (const [i, { map }] of LEVELS.entries()) {
    if (
      map.length !== BLOCK_ROWS.length ||
      map.some((row) => row.length !== BLOCK_COLUMNS)
    ) {
      throw new Error(
        `Nivel ${i + 1}: el mapa debe tener 6 filas × 12 columnas`,
      );
    }
  }
}
