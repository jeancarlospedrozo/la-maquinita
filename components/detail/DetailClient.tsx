"use client";

import { useState } from "react";
import { SegmentedTabs } from "@/components/ui";
import { gameLeaderboard, pad2, positionColor } from "@/lib/data";
import { useFavorites } from "@/lib/useFavorites";

export function FavShareButtons({ slug, name }: { slug: string; name: string }) {
  const { isFav, toggle } = useFavorites();
  const [copied, setCopied] = useState(false);
  const fav = isFav(slug);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {}
  };

  return (
    <div className="hidden gap-3 lg:flex">
      <button
        type="button"
        onClick={() => toggle(slug)}
        aria-pressed={fav}
        className={`flex h-11 flex-1 items-center justify-center rounded text-sm font-semibold ${
          fav ? "lm-btn-ghost" : "border border-line hover:border-cyan"
        }`}
      >
        {fav ? "♥ En favoritos" : "♡ Añadir a favoritos"}
      </button>
      <button
        type="button"
        onClick={share}
        className="flex h-11 flex-1 items-center justify-center rounded border border-line text-sm font-medium hover:border-cyan"
      >
        {copied ? "¡Enlace copiado!" : "Compartir"}
      </button>
    </div>
  );
}

const PERIODS = ["Hoy", "Semana", "Histórico"] as const;

export function GameLeaderboard({ short = false }: { short?: boolean }) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Semana");
  const rows = short ? gameLeaderboard.slice(0, 5) : gameLeaderboard;

  return (
    <div className="flex flex-col gap-3">
      {!short && <h2 className="font-pixel text-[22px]">Leaderboard</h2>}
      <SegmentedTabs
        options={PERIODS}
        value={period}
        onChange={setPeriod}
        className={short ? "mt-2 bg-panel text-[13px]" : "bg-ink"}
      />
      {/* TODO: cargar puntuaciones por periodo desde la API */}
      <ol className="flex flex-col">
        {rows.map((r, i) => (
          <li
            key={r.name}
            className={`grid items-center rounded-[3px] ${
              short ? "grid-cols-[28px_1fr_auto] gap-2.5 p-2" : "grid-cols-[32px_1fr_auto] gap-3 px-2 py-[9px]"
            }`}
            style={{ background: r.me ? "rgba(255,46,136,.14)" : "transparent" }}
          >
            <span
              className={`font-mono ${short ? "text-[13px]" : "text-sm"}`}
              style={{ color: r.me ? "#FF2E88" : positionColor(i) }}
            >
              {r.me ? `#${r.pos}` : pad2(i + 1)}
            </span>
            <span className={`font-medium ${short ? "text-sm" : "text-[15px]"}`}>{r.name}</span>
            <span className={`font-mono text-gold ${short ? "text-sm" : "text-[15px]"}`}>{r.score}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
