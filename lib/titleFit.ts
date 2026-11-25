// Ancho de los títulos en la fuente pixel (Silkscreen), para que el título de la ficha
// quepa en su columna sin partir palabras (specs/003-instant-game-pages/research.md R6).
//
// Los avances son exactos: Silkscreen usa múltiplos de 1/8 em y no tiene kerning
// (medidos en el navegador a 100 px; la suma de LADRILLAZO da 6.625 em, igual que la palabra).

const ADVANCES: Record<string, number> = {};
const set = (chars: string, em: number) => {
  for (const c of chars) ADVANCES[c] = em;
};
set("ABCDGHJKOPQRSUÁÓÚÜ?¿023456789", 0.75);
set("EFLTZÉ1-", 0.625);
set("IÍ.!¡:'", 0.375);
set("MNÑVWXY", 0.875);

/** Carácter desconocido: el más ancho, así el título nunca se sale. */
const FALLBACK = 0.875;

/** Ancho en em de la palabra más larga del título, en mayúsculas. */
export function titleEm(name: string): number {
  return Math.max(
    ...name
      .toUpperCase()
      .split(/\s+/)
      .map((word) =>
        [...word].reduce((sum, c) => sum + (ADVANCES[c] ?? FALLBACK), 0),
      ),
  );
}
