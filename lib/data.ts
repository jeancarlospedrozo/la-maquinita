// Datos de ejemplo del portal. Reemplazar por la API / base de datos real.

export type Category =
  | "Shooter"
  | "Plataformas"
  | "Puzzle"
  | "Carreras"
  | "Lucha"
  | "Clásicos";

export type Difficulty = "Fácil" | "Media" | "Difícil";
export type Players = "1 jugador" | "2 jugadores" | "4 jugadores";
export type Duration = "< 3 min" | "3–10 min" | "> 10 min";

export type Badge = { label: "HOT" | "NUEVO" | "RÉCORD"; color: string };

export type Game = {
  slug: string;
  name: string;
  category: Category;
  record: string;
  badge?: Badge;
  difficulty: Difficulty;
  players: Players;
  duration: Duration;
  rating: number;
  votes: string;
  plays: string;
  popularity: number;
  releasedAt: string; // ISO
  tagline: string;
  description: string;
};

const HOT: Badge = { label: "HOT", color: "#FF2E88" };
const NEW: Badge = { label: "NUEVO", color: "#39FF14" };
const REC: Badge = { label: "RÉCORD", color: "#FFD60A" };

export const games: Game[] = [
  {
    slug: "cometa-loca",
    name: "Cometa Loca",
    category: "Shooter",
    record: "1.284.550",
    badge: HOT,
    difficulty: "Media",
    players: "1 jugador",
    duration: "< 3 min",
    rating: 4.8,
    votes: "8.912",
    plays: "2,4M",
    popularity: 100,
    releasedAt: "2026-03-02",
    tagline:
      "Esquiva lluvia de asteroides, recoge chatarra espacial y encadena combos hasta que la nave no aguante más. Partidas de 3 minutos.",
    description:
      "Un cometa se partió en mil pedazos y todos vienen hacia tu nave. Cada ola acelera el ritmo; cada fragmento recogido suma al multiplicador. Pierdes una vida por impacto: tienes tres.",
  },
  {
    slug: "salto-pixel",
    name: "Salto Pixel",
    category: "Plataformas",
    record: "98.420",
    badge: NEW,
    difficulty: "Fácil",
    players: "1 jugador",
    duration: "3–10 min",
    rating: 4.5,
    votes: "2.140",
    plays: "310K",
    popularity: 88,
    releasedAt: "2026-10-28",
    tagline: "Salta, rebota y no mires abajo.",
    description:
      "Un pixel perdido intenta volver a su pantalla. Plataformas que se desmoronan, resortes y monedas escondidas en cada rincón.",
  },
  {
    slug: "bloques-bravos",
    name: "Bloques Bravos",
    category: "Puzzle",
    record: "456.900",
    difficulty: "Media",
    players: "1 jugador",
    duration: "3–10 min",
    rating: 4.6,
    votes: "5.031",
    plays: "1,1M",
    popularity: 92,
    releasedAt: "2025-11-12",
    tagline: "Encaja piezas antes de que se enfaden.",
    description:
      "Bloques con mal genio caen sin parar. Completa líneas para calmarlos y encadena limpiezas para multiplicar tu puntuación.",
  },
  {
    slug: "turbo-taco",
    name: "Turbo Taco",
    category: "Carreras",
    record: "02:14.37",
    badge: HOT,
    difficulty: "Media",
    players: "2 jugadores",
    duration: "< 3 min",
    rating: 4.7,
    votes: "4.410",
    plays: "980K",
    popularity: 95,
    releasedAt: "2026-06-18",
    tagline: "Carreras callejeras a toda salsa.",
    description:
      "Derrapa por las calles de la ciudad en un carrito de tacos con turbo. Atajos, picante extra y rivales sin escrúpulos.",
  },
  {
    slug: "puno-neon",
    name: "Puño Neón",
    category: "Lucha",
    record: "312.000",
    difficulty: "Difícil",
    players: "2 jugadores",
    duration: "3–10 min",
    rating: 4.4,
    votes: "3.287",
    plays: "640K",
    popularity: 80,
    releasedAt: "2026-01-20",
    tagline: "Combos de luz en la azotea.",
    description:
      "Luchadores de neón se enfrentan bajo la lluvia. Aprende combos, bloquea a tiempo y remata con el especial.",
  },
  {
    slug: "ladrillazo",
    name: "Ladrillazo",
    category: "Clásicos",
    record: "742.110",
    badge: REC,
    difficulty: "Media",
    players: "1 jugador",
    duration: "3–10 min",
    rating: 4.7,
    votes: "6.902",
    plays: "1,8M",
    popularity: 90,
    releasedAt: "2025-08-05",
    tagline: "Rompe el muro, salva la pelota.",
    description:
      "El clásico de paleta y ladrillos con power-ups modernos: bola múltiple, láser y ladrillos que contraatacan.",
  },
  {
    slug: "rana-turbo",
    name: "Rana Turbo",
    category: "Clásicos",
    record: "58.300",
    badge: NEW,
    difficulty: "Fácil",
    players: "1 jugador",
    duration: "< 3 min",
    rating: 4.2,
    votes: "980",
    plays: "120K",
    popularity: 70,
    releasedAt: "2026-11-01",
    tagline: "Cruza la autopista sin ser panqueque.",
    description:
      "Una rana con prisa cruza carriles, ríos y troncos. Cada cruce sube la velocidad del tráfico.",
  },
  {
    slug: "galaxia-chicle",
    name: "Galaxia Chicle",
    category: "Shooter",
    record: "204.880",
    difficulty: "Media",
    players: "1 jugador",
    duration: "3–10 min",
    rating: 4.3,
    votes: "1.760",
    plays: "410K",
    popularity: 84,
    releasedAt: "2026-02-14",
    tagline: "Invasores dulces, disparos pegajosos.",
    description:
      "Oleadas de alienígenas de chicle descienden en formación. Revienta burbujas para conseguir mejoras de disparo.",
  },
  {
    slug: "mina-magica",
    name: "Mina Mágica",
    category: "Puzzle",
    record: "77.150",
    badge: NEW,
    difficulty: "Difícil",
    players: "1 jugador",
    duration: "> 10 min",
    rating: 4.1,
    votes: "640",
    plays: "88K",
    popularity: 60,
    releasedAt: "2026-10-30",
    tagline: "Excava gemas, esquiva rocas.",
    description:
      "Cava túneles, empuja rocas y recoge gemas antes de que el derrumbe te alcance. 40 niveles de lógica subterránea.",
  },
  {
    slug: "dino-derrape",
    name: "Dino Derrape",
    category: "Carreras",
    record: "01:58.02",
    difficulty: "Fácil",
    players: "4 jugadores",
    duration: "< 3 min",
    rating: 4.0,
    votes: "1.120",
    plays: "230K",
    popularity: 66,
    releasedAt: "2026-05-09",
    tagline: "Karts jurásicos para toda la familia.",
    description:
      "Dinosaurios al volante en circuitos prehistóricos. Hasta cuatro jugadores en pantalla compartida.",
  },
  {
    slug: "fantasmin",
    name: "Fantasmín",
    category: "Plataformas",
    record: "133.400",
    difficulty: "Media",
    players: "1 jugador",
    duration: "3–10 min",
    rating: 4.4,
    votes: "1.980",
    plays: "350K",
    popularity: 74,
    releasedAt: "2026-04-01",
    tagline: "Atraviesa paredes, no lámparas.",
    description:
      "Un fantasma tímido recorre una mansión encantada. Vuélvete intangible para cruzar muros, pero evita la luz.",
  },
  {
    slug: "robo-rumba",
    name: "Robo Rumba",
    category: "Lucha",
    record: "189.920",
    difficulty: "Difícil",
    players: "2 jugadores",
    duration: "< 3 min",
    rating: 4.2,
    votes: "1.410",
    plays: "270K",
    popularity: 72,
    releasedAt: "2026-07-22",
    tagline: "Robots que bailan a golpes.",
    description:
      "Robots de chatarra pelean al ritmo de la música. Golpea en el compás para cargar el super.",
  },
];

export function getGame(slug: string) {
  return games.find((g) => g.slug === slug);
}

export function gamesByCategory(category: Category) {
  return games.filter((g) => g.category === category);
}

export const featuredGame = games[0];

export const popularGames = [...games]
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 4);

export const newReleases = [...games]
  .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
  .slice(0, 6);

export const categories: { name: Category; color: string }[] = [
  { name: "Shooter", color: "#FF2E88" },
  { name: "Plataformas", color: "#00E5FF" },
  { name: "Puzzle", color: "#FFD60A" },
  { name: "Carreras", color: "#39FF14" },
  { name: "Lucha", color: "#FF3B3B" },
  { name: "Clásicos", color: "#A59FC7" },
];

// Conteos de catálogo completo (148 juegos) del diseño.
export const categoryCounts: Record<Category, number> = {
  Shooter: 24,
  Plataformas: 31,
  Puzzle: 27,
  Carreras: 18,
  Lucha: 12,
  Clásicos: 36,
};

export const CATALOG_TOTAL = 148;

export const difficulties: Difficulty[] = ["Fácil", "Media", "Difícil"];
export const playerOptions: Players[] = ["1 jugador", "2 jugadores", "4 jugadores"];
export const durations: Duration[] = ["< 3 min", "3–10 min", "> 10 min"];

/** Color de la posición en rankings: oro, cian, rosa; resto apagado. */
export function positionColor(index: number) {
  return ["#FFD60A", "#00E5FF", "#FF2E88"][index] ?? "#A59FC7";
}

export const pad2 = (n: number) => String(n).padStart(2, "0");

// ---------- Rankings ----------

export type RankRow = {
  initials: string;
  name: string;
  game: string;
  score: string;
  level?: number;
  date?: string;
};

export const top5: RankRow[] = [
  { initials: "KAI", name: "kaiser_88", game: "Cometa Loca", score: "1.284.550" },
  { initials: "LUZ", name: "luzbel.exe", game: "Ladrillazo", score: "742.110" },
  { initials: "MOX", name: "moxie", game: "Bloques Bravos", score: "456.900" },
  { initials: "ZEP", name: "zeppo_77", game: "Puño Neón", score: "312.000" },
  { initials: "NIA", name: "nia.pix", game: "Galaxia Chicle", score: "204.880" },
];

export const podium = [
  { pos: 2, initials: "LUZ", name: "luzbel.exe", game: "Ladrillazo", score: "742.110", short: "742K", color: "#00E5FF", glow: "rgba(0,229,255,.35)" },
  { pos: 1, initials: "KAI", name: "kaiser_88", game: "Cometa Loca", score: "1.284.550", short: "1,28M", color: "#FFD60A", glow: "rgba(255,214,10,.35)" },
  { pos: 3, initials: "MOX", name: "moxie", game: "Bloques Bravos", score: "456.900", short: "457K", color: "#FF2E88", glow: "rgba(255,46,136,.35)" },
];

export const rankingTable: RankRow[] = [
  { initials: "ZEP", name: "zeppo_77", game: "Puño Neón", score: "312.000", level: 42, date: "08 nov" },
  { initials: "NIA", name: "nia.pix", game: "Galaxia Chicle", score: "204.880", level: 38, date: "08 nov" },
  { initials: "VEC", name: "vector_v", game: "Cometa Loca", score: "198.420", level: 51, date: "07 nov" },
  { initials: "TUK", name: "tuki", game: "Salto Pixel", score: "98.420", level: 27, date: "07 nov" },
  { initials: "RAY", name: "raydo", game: "Fantasmín", score: "133.400", level: 33, date: "06 nov" },
  { initials: "QRK", name: "quark", game: "Turbo Taco", score: "02:14.37", level: 19, date: "06 nov" },
  { initials: "MON", name: "m0nch1", game: "Mina Mágica", score: "77.150", level: 22, date: "05 nov" },
];

export const currentPlayer = {
  handle: "pixel_pao",
  coins: "2.450",
  position: 142,
  delta: 18,
  game: "Cometa Loca",
  score: "84.120",
  best: "84.120",
};

export const gameLeaderboard = [
  { name: "kaiser_88", score: "1.284.550" },
  { name: "nia.pix", score: "1.102.300" },
  { name: "vector_v", score: "988.420" },
  { name: "tuki", score: "871.010" },
  { name: "raydo", score: "799.640" },
  { name: "pixel_pao (tú)", score: "84.120", me: true, pos: 212 },
  { name: "quark", score: "80.990" },
  { name: "m0nch1", score: "79.300" },
];

export const achievements = [
  { icon: "★", name: "Primer despegue", desc: "Completa la ola 1", locked: false },
  { icon: "x10", name: "Combo loco", desc: "Encadena 10 fragmentos", locked: false },
  { icon: "◆", name: "Intocable", desc: "Ola 5 sin perder vidas", locked: true },
  { icon: "∞", name: "Leyenda", desc: "Supera 1.000.000 pts", locked: true },
];

// ---------- Torneo ----------

export const tournament = {
  name: "Copa Ladrillazo de Otoño",
  shortName: "Copa Ladrillazo",
  entrants: "1.204",
  prize: "50.000 monedas e insignia exclusiva",
  endsAt: "2026-11-30T23:59:59-05:00",
};
