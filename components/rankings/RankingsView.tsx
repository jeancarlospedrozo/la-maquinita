"use client";

import { useState } from "react";
import { PlayerInitials, SegmentedTabs } from "@/components/ui";
import { currentPlayer, pad2, podium, rankingTable } from "@/lib/data";

const SCOPES = ["Global", "Por juego", "Amigos"] as const;
const PERIODS = ["Hoy", "Semana", "Mes", "Histórico"] as const;
type Scope = (typeof SCOPES)[number];
type Period = (typeof PERIODS)[number];

const COLS = "lg:grid-cols-[80px_1fr_220px_180px_140px]";

export function RankingsView() {
  const [scope, setScope] = useState<Scope>("Global");
  const [period, setPeriod] = useState<Period>("Semana");
  // TODO: pedir a la API el ranking según `scope` y `period`.

  return (
    <div className="flex flex-col">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 px-5 pt-5 lg:flex-row lg:items-end lg:gap-6 lg:px-12 lg:pt-12">
        <div className="flex flex-col gap-4 lg:gap-5">
          <h1 className="font-pixel text-[26px] lg:text-[44px]" style={{ textShadow: "0 0 14px rgba(255,214,10,.45)" }}>
            Rankings
          </h1>
          <div role="tablist" className="flex gap-5 border-b border-line text-sm font-medium lg:gap-7 lg:border-b-0 lg:text-base">
            {SCOPES.map((s) => (
              <button
                key={s}
                role="tab"
                type="button"
                aria-selected={s === scope}
                onClick={() => setScope(s)}
                className={`-mb-px border-b-2 pb-2.5 ${s === scope ? "border-cyan text-cyan" : "border-transparent text-muted hover:text-text"}`}
              >
                {s}
              </button>
            ))}
            <label className="relative ml-auto pb-2.5 text-text lg:hidden">
              <span className="sr-only">Periodo</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="appearance-none bg-transparent pr-4 outline-none"
              >
                {PERIODS.map((p) => (
                  <option key={p} className="bg-panel">{p}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-0">▾</span>
            </label>
          </div>
        </div>
        <SegmentedTabs
          options={PERIODS}
          value={period}
          onChange={setPeriod}
          itemClassName="px-4"
          className="mb-2.5 ml-auto hidden border border-line bg-panel lg:flex"
        />
      </div>

      {/* Podio */}
      <div className="mx-auto grid w-full max-w-[1000px] grid-cols-[1fr_1.1fr_1fr] items-end gap-2 px-5 pt-7 lg:grid-cols-[1fr_1.15fr_1fr] lg:gap-6 lg:px-12 lg:pt-14">
        {podium.map((p) => {
          const first = p.pos === 1;
          return (
            <div key={p.pos} className="flex flex-col items-center gap-1.5 lg:gap-3.5">
              <span
                className={`grid place-items-center rounded border-2 bg-line font-pixel text-[11px] lg:rounded-md lg:border-[3px] lg:text-base ${
                  first ? "size-11 lg:size-[84px]" : "size-11 lg:size-16"
                }`}
                style={{ borderColor: p.color, boxShadow: `0 0 20px ${p.glow}` }}
              >
                {p.initials}
              </span>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-semibold lg:text-lg">{p.name}</span>
                <span className="hidden text-[13px] text-muted lg:block">{p.game}</span>
              </div>
              <span className="font-mono text-xs lg:text-2xl" style={{ color: p.color }}>
                <span className="lg:hidden">{p.short}</span>
                <span className="hidden lg:inline">{p.score}</span>
              </span>
              <div
                className={`grid w-full place-items-start justify-center rounded-t border-[1.5px] border-b-0 pt-2 font-pixel text-2xl lg:rounded-t-md lg:pt-4 lg:text-[44px] ${
                  p.pos === 1 ? "h-[90px] lg:h-[180px]" : p.pos === 2 ? "h-16 lg:h-[130px]" : "h-12 lg:h-[100px]"
                }`}
                style={{
                  background: `linear-gradient(180deg,${p.glow},transparent)`,
                  borderColor: p.color,
                  color: p.color,
                  textShadow: `0 0 16px ${p.color}`,
                }}
              >
                {p.pos}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla */}
      <div className="px-5 pb-4 lg:px-12 lg:pb-0">
        <div className="lg:overflow-hidden lg:rounded-md lg:border lg:border-line">
          <div className={`hidden gap-4 bg-panel px-6 py-3.5 font-mono text-xs tracking-[1.5px] text-muted lg:grid ${COLS}`}>
            <span>POS</span>
            <span>JUGADOR</span>
            <span>JUEGO</span>
            <span className="text-right">PUNTUACIÓN</span>
            <span className="text-right">FECHA</span>
          </div>
          <ol>
            {rankingTable.map((r, i) => (
              <li
                key={r.name}
                className={`grid grid-cols-[30px_32px_1fr_auto] items-center gap-2.5 border-b border-line py-2.5 lg:gap-4 lg:border-b-0 lg:border-t lg:px-6 lg:py-3.5 lg:hover:bg-panel ${COLS}`}
              >
                <span className="font-mono text-[13px] text-muted lg:text-base">{pad2(i + 4)}</span>
                <span className="lg:hidden">
                  <PlayerInitials initials={r.initials} size={32} />
                </span>
                <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                  <span className="hidden lg:block">
                    <PlayerInitials initials={r.initials} />
                  </span>
                  <span className="text-sm font-medium lg:text-base lg:font-semibold">{r.name}</span>
                  <span className="hidden rounded-[3px] border border-cyan px-1.5 py-0.5 font-mono text-[11px] text-cyan lg:inline">
                    LV {r.level}
                  </span>
                  <span className="text-[11px] text-muted lg:hidden">{r.game}</span>
                </div>
                <span className="hidden text-[15px] text-muted lg:block">{r.game}</span>
                <span className="text-right font-mono text-sm text-gold lg:text-[17px]">{r.score}</span>
                <span className="hidden text-right font-mono text-[13px] text-muted lg:block">{r.date}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <button type="button" className="hidden justify-center px-12 pb-12 pt-6 font-mono text-sm text-cyan hover:text-text lg:flex">
        Cargar más ↓
      </button>

      {/* Tu posición (fija abajo) */}
      <div
        id="tu-posicion"
        className={`sticky bottom-[76px] z-20 mx-3 mb-3 grid grid-cols-[44px_32px_1fr_auto] items-center gap-2.5 rounded-md border-[1.5px] border-pink bg-panel p-3 lg:bottom-0 lg:mx-12 lg:mb-8 lg:gap-4 lg:px-6 lg:py-[18px] ${COLS}`}
        style={{ boxShadow: "0 0 30px rgba(255,46,136,.3)" }}
      >
        <span className="font-mono text-sm font-bold text-pink lg:text-lg">#{currentPlayer.position}</span>
        <span className="lg:hidden">
          <PlayerInitials initials="P1" size={32} highlight />
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden lg:block">
            <PlayerInitials initials="P1" highlight />
          </span>
          <span className="text-sm font-semibold lg:text-base">
            <span className="lg:hidden">Tu posición</span>
            <span className="hidden lg:inline">Tú · {currentPlayer.handle}</span>
          </span>
          <span className="hidden text-[13px] text-lime lg:inline">▲ {currentPlayer.delta} esta semana</span>
        </div>
        <span className="hidden text-[15px] text-muted lg:block">{currentPlayer.game}</span>
        <span className="text-right font-mono text-sm text-gold lg:text-[17px]">{currentPlayer.score}</span>
        <span className="hidden text-right font-mono text-[13px] text-muted lg:block">hoy</span>
      </div>
    </div>
  );
}
