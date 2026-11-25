// Sprites de Ladrillazo, portados de references/arkanoid/assets/spritesheet.js.
// Sin estado de módulo: la hoja se carga con loadSpritesheet() y se pasa a las funciones de dibujo.
//
// Ojo: las claves de color no coinciden con el dibujo (cyan es verde azulado, green es azul,
// magenta es morado, hotpink es naranja), y gray explota con la fila roja, como en el original.

export type SpriteRect = { sx: number; sy: number; sw: number; sh: number };

export const SPRITES = {
  paddle: { sx: 32, sy: 112, sw: 162, sh: 14 },
  ball: { sx: 32, sy: 32, sw: 16, sh: 16 },
  blocks: {
    gray: { sx: 32, sy: 288, sw: 32, sh: 16 },
    red: { sx: 32, sy: 176, sw: 32, sh: 16 },
    yellow: { sx: 32, sy: 240, sw: 32, sh: 16 },
    cyan: { sx: 32, sy: 192, sw: 32, sh: 16 },
    magenta: { sx: 32, sy: 224, sw: 32, sh: 16 },
    hotpink: { sx: 32, sy: 256, sw: 32, sh: 16 },
    green: { sx: 32, sy: 208, sw: 32, sh: 16 },
  },
} satisfies {
  paddle: SpriteRect;
  ball: SpriteRect;
  blocks: Record<string, SpriteRect>;
};

export type SpriteBlockColor = keyof typeof SPRITES.blocks;
export type SpriteName = "paddle" | "ball" | `block_${SpriteBlockColor}`;

/** 4 fotogramas de 32×16 por fila, empezando en x = 256. */
const explosionRow = (sy: number): SpriteRect[] =>
  [256, 288, 320, 352].map((sx) => ({ sx, sy, sw: 32, sh: 16 }));

export const EXPLOSION_FRAMES: Record<SpriteBlockColor, SpriteRect[]> = {
  red: explosionRow(176),
  cyan: explosionRow(192),
  green: explosionRow(208),
  magenta: explosionRow(224),
  yellow: explosionRow(240),
  hotpink: explosionRow(256),
  gray: explosionRow(176),
};

/** Duración de la explosión de un bloque, en ms. */
export const EXPLOSION_DURATION = 150;

export type Spritesheet = HTMLCanvasElement;

/** Carga la hoja de sprites y la copia a un canvas fuera de pantalla. */
export async function loadSpritesheet(url: string): Promise<Spritesheet> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const sheet = document.createElement("canvas");
  sheet.width = img.naturalWidth;
  sheet.height = img.naturalHeight;
  sheet.getContext("2d")?.drawImage(img, 0, 0);
  return sheet;
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  sheet: Spritesheet,
  frame: SpriteRect,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.drawImage(sheet, frame.sx, frame.sy, frame.sw, frame.sh, x, y, w, h);
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sheet: Spritesheet,
  name: SpriteName,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const rect = name.startsWith("block_")
    ? SPRITES.blocks[name.slice(6) as SpriteBlockColor]
    : SPRITES[name as "paddle" | "ball"];
  drawFrame(ctx, sheet, rect, x, y, w, h);
}
