"use client";

import { useState, type ReactNode } from "react";
import { GameCard } from "@/components/ui";
import {
  categories,
  difficulties,
  durations,
  games,
  playerOptions,
  type Category,
  type Difficulty,
  type Duration,
  type Game,
  type Players,
} from "@/lib/data";
import { useFavorites } from "@/lib/useFavorites";

const SORTS = {
  popular: { label: "Más popular", fn: (a: Game, b: Game) => b.popularity - a.popularity },
  nuevo: { label: "Más nuevo", fn: (a: Game, b: Game) => b.releasedAt.localeCompare(a.releasedAt) },
  valorado: { label: "Mejor valorado", fn: (a: Game, b: Game) => b.rating - a.rating },
  az: { label: "A → Z", fn: (a: Game, b: Game) => a.name.localeCompare(b.name, "es") },
} as const;
type SortKey = keyof typeof SORTS;

const PAGE_SIZE = 12;

type Filters = {
  category: Category[];
  difficulty: Difficulty[];
  players: Players[];
  duration: Duration[];
};
type FilterKey = keyof Filters;

const GROUPS: { key: FilterKey; title: string; options: readonly string[] }[] = [
  { key: "category", title: "CATEGORÍA", options: categories.map((c) => c.name) },
  { key: "difficulty", title: "DIFICULTAD", options: difficulties },
  { key: "players", title: "JUGADORES", options: playerOptions },
  { key: "duration", title: "DURACIÓN", options: durations },
];

const fieldOf: Record<FilterKey, keyof Game> = {
  category: "category",
  difficulty: "difficulty",
  players: "players",
  duration: "duration",
};

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Catalog({
  initialQuery = "",
  initialCategory,
}: {
  initialQuery?: string;
  initialCategory?: Category;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("popular");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: initialCategory ? [initialCategory] : [],
    difficulty: [],
    players: [],
    duration: [],
  });
  const { isFav } = useFavorites();

  const matchesExcept = (g: Game, skip?: FilterKey) =>
    (Object.keys(filters) as FilterKey[]).every((k) => {
      if (k === skip) return true;
      const sel = filters[k] as string[];
      return sel.length === 0 || sel.includes(g[fieldOf[k]] as string);
    });

  const textMatches = (g: Game) => {
    const q = normalize(query.trim());
    if (!q) return true;
    return normalize(`${g.name} ${g.category} ${g.tagline}`).includes(q);
  };

  const results = games.filter((g) => textMatches(g) && matchesExcept(g)).sort(SORTS[sort].fn);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const activeChips = GROUPS.flatMap((grp) =>
    (filters[grp.key] as string[]).map((v) => ({ key: grp.key, value: v })),
  );

  const toggle = (key: FilterKey, value: string) => {
    setPage(1);
    setFilters((f) => {
      const cur = f[key] as string[];
      return { ...f, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  };
  const clear = () => {
    setPage(1);
    setQuery("");
    setFilters({ category: [], difficulty: [], players: [], duration: [] });
  };

  return (
    <>
      {/* Cabecera + búsqueda */}
      <div className="flex flex-col gap-3.5 p-5 lg:gap-6 lg:border-b lg:border-line lg:px-12 lg:pb-8 lg:pt-12">
        <div className="flex items-baseline gap-4">
          <h1 className="font-pixel text-[26px] lg:text-[44px]" style={{ textShadow: "0 0 14px rgba(0,229,255,.5)" }}>
            Catálogo
          </h1>
          <span className="font-mono text-[13px] text-muted lg:text-[15px]">{results.length} juegos</span>
        </div>
        <div className="flex gap-4">
          <label className="flex h-12 flex-1 items-center gap-3.5 rounded border border-line bg-panel px-3.5 text-[15px] focus-within:border-[1.5px] focus-within:border-cyan focus-within:shadow-[0_0_0_3px_rgba(0,229,255,.15)] lg:h-14 lg:px-5 lg:text-[17px]">
            <span aria-hidden className="size-3 rounded-full border-2 border-cyan lg:size-3.5" />
            <span className="sr-only">Buscar juegos</span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar juegos…"
              className="h-full flex-1 bg-transparent caret-cyan outline-none placeholder:text-muted"
            />
          </label>
          <label className="relative hidden h-14 w-60 items-center rounded border border-line bg-panel px-[18px] text-[15px] text-muted lg:flex">
            Orden:&nbsp;
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-full flex-1 appearance-none bg-transparent font-medium text-text outline-none"
            >
              {(Object.keys(SORTS) as SortKey[]).map((k) => (
                <option key={k} value={k} className="bg-panel">
                  {SORTS[k].label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none text-cyan">▾</span>
          </label>
        </div>
        {/* Chips móviles */}
        <div className="flex gap-2 overflow-x-auto lg:hidden">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className="flex-none rounded-full bg-cyan px-3 py-[7px] text-[13px] font-semibold text-ink"
          >
            Filtros{activeChips.length ? ` · ${activeChips.length}` : ""}
          </button>
          {activeChips.map((c) => (
            <ActiveChip key={c.key + c.value} label={c.value} onRemove={() => toggle(c.key, c.value)} />
          ))}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        {/* Filtros */}
        <aside
          className={`${showFilters ? "flex" : "hidden"} flex-col gap-8 border-b border-line px-5 pb-6 lg:flex lg:border-b-0 lg:border-r lg:py-8 lg:pl-12 lg:pr-8`}
        >
          {GROUPS.map((grp) => (
            <fieldset key={grp.key} className="flex flex-col gap-3">
              <legend className="mb-3 font-mono text-xs tracking-[1.5px] text-muted">{grp.title}</legend>
              {grp.options.map((opt) => {
                const on = (filters[grp.key] as string[]).includes(opt);
                const n = games.filter(
                  (g) => textMatches(g) && matchesExcept(g, grp.key) && g[fieldOf[grp.key]] === opt,
                ).length;
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-2.5 text-[15px] ${on ? "text-text" : "text-muted hover:text-text"}`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggle(grp.key, opt)} className="peer sr-only" />
                    <span
                      className={`grid size-4 place-items-center rounded-[2px] border-[1.5px] text-[11px] font-bold text-ink peer-focus-visible:outline peer-focus-visible:outline-cyan ${
                        on ? "border-cyan bg-cyan" : "border-line"
                      }`}
                    >
                      {on ? "✓" : ""}
                    </span>
                    {opt}
                    <span className="ml-auto font-mono text-xs text-muted">{n}</span>
                  </label>
                );
              })}
            </fieldset>
          ))}
          <button type="button" onClick={clear} className="self-start text-sm font-medium text-cyan hover:text-text">
            Limpiar filtros
          </button>
        </aside>

        {/* Resultados */}
        <div className="flex flex-col gap-8 px-5 pb-8 lg:px-12 lg:pb-12 lg:pt-8">
          {activeChips.length > 0 && (
            <div className="hidden flex-wrap gap-2 lg:flex">
              {activeChips.map((c) => (
                <ActiveChip key={c.key + c.value} label={c.value} onRemove={() => toggle(c.key, c.value)} />
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            <EmptyState onClear={clear} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {visible.map((g) => (
                <GameCard key={g.slug} game={g} fav={isFav(g.slug)} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Paginación" className="flex justify-center gap-2 font-mono text-sm">
              <PageBtn disabled={current === 1} onClick={() => setPage(current - 1)} label="Anterior">←</PageBtn>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <PageBtn key={p} active={p === current} onClick={() => setPage(p)} label={`Página ${p}`}>
                  {p}
                </PageBtn>
              ))}
              <PageBtn disabled={current === pages} onClick={() => setPage(current + 1)} label="Siguiente">→</PageBtn>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Quitar filtro ${label}`}
      className="flex flex-none items-center gap-2 rounded-full border border-cyan px-3 py-1.5 text-[13px] text-cyan hover:bg-cyan/10"
    >
      {label} ✕
    </button>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-md border-[1.5px] border-dashed border-line px-6 py-10 text-center">
      <span className="font-pixel text-[44px] text-line" aria-hidden>
        0 0 0
      </span>
      <span className="font-pixel text-lg">Sin resultados</span>
      <span className="text-[15px] leading-normal text-muted">No se encontraron juegos. ¿Probamos otro filtro?</span>
      <button type="button" onClick={onClear} className="lm-btn-ghost h-11 rounded px-5 font-semibold">
        Limpiar filtros
      </button>
    </div>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  label,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`grid size-10 place-items-center rounded ${
        active
          ? "bg-cyan font-bold text-ink"
          : disabled
            ? "border border-line text-muted"
            : "border border-cyan text-cyan"
      }`}
    >
      {children}
    </button>
  );
}
