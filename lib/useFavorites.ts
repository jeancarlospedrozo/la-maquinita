"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "lm-favs";
const DEFAULT = ["cometa-loca", "ladrillazo"];
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as string[]) : DEFAULT;
  } catch {
    cache = DEFAULT;
  }
  return cache;
}

function write(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Favoritos del jugador (localStorage hasta que exista backend). */
export function useFavorites() {
  const favs = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const toggle = useCallback((slug: string) => {
    const cur = read();
    write(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
  }, []);
  return { favs, isFav: (slug: string) => favs.includes(slug), toggle };
}
