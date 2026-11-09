"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Blink } from "@/components/ui";

/**
 * Pantalla de juego (modo foco). Gestiona los estados del diseño:
 * carga → inicio → jugando ⇄ pausa → game over | nuevo récord.
 *
 * El área "canvas del juego" es un hueco: monta ahí el motor real y llama a
 * `addScore`, `loseLife` y `endGame`. Mientras no exista, un modo demo simula
 * la partida para poder recorrer todos los estados.
 */

type State = "loading" | "start" | "playing" | "pause" | "over" | "record";

const MAX_LIVES = 3;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_".split("");

const group = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const fmtScore = (n: number) => group(String(n));
const fmtHud = (n: number) => group(String(n).padStart(6, "0"));
const parseScore = (s: string) => Number(s.replace(/\D/g, "")) || 0;

export function GameScreen({
  slug,
  name,
  globalRecord,
  globalHolder,
  personalBest,
}: {
  slug: string;
  name: string;
  globalRecord: string;
  globalHolder: string;
  personalBest: string;
}) {
  const [state, setState] = useState<State>("loading");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [best, setBest] = useState(parseScore(personalBest));
  const [sound, setSound] = useState(true);
  const [initials, setInitials] = useState(["P", "A", "_"]);
  const [cursor, setCursor] = useState(2);
  const [saved, setSaved] = useState(false);
  const cabinetRef = useRef<HTMLDivElement>(null);
  const [finalScore, setFinalScore] = useState(0);

  // --- Carga simulada de assets ---
  useEffect(() => {
    if (state !== "loading") return;
    if (progress >= 14) {
      const done = setTimeout(() => setState("start"), 250);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setProgress((p) => p + 1), 90);
    return () => clearTimeout(t);
  }, [state, progress]);

  const endGame = useCallback(
    (final: number) => {
      setFinalScore(final);
      setSaved(false);
      setState(final > best ? "record" : "over");
    },
    [best],
  );

  const start = useCallback(() => {
    setScore(0);
    setLives(MAX_LIVES);
    setState("playing");
  }, []);

  // --- Modo demo: puntos continuos, una vida menos cada ~6 s ---
  useEffect(() => {
    if (state !== "playing") return;
    const tick = setInterval(() => setScore((s) => s + 137 + Math.floor(Math.random() * 400)), 100);
    const hit = setInterval(() => setLives((l) => l - 1), 6000);
    return () => {
      clearInterval(tick);
      clearInterval(hit);
    };
  }, [state]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- transición al quedarse sin vidas
    if (state === "playing" && lives <= 0) endGame(score);
  }, [lives, state, score, endGame]);

  const togglePause = useCallback(() => {
    setState((s) => (s === "playing" ? "pause" : s === "pause" ? "playing" : s));
  }, []);

  const saveRecord = useCallback(() => {
    setBest(finalScore);
    setSaved(true);
    // TODO: enviar { slug, initials, score } a la API de rankings.
    setState("over");
  }, [finalScore]);

  const fullscreen = useCallback(() => {
    const el = cabinetRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);

  // --- Teclado ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state === "start" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        start();
      } else if ((state === "playing" || state === "pause") && (e.key === "p" || e.key === "P" || e.key === "Escape")) {
        togglePause();
      } else if (state === "over" && e.key === "Enter") {
        start();
      } else if (state === "record") {
        const cycle = (d: number) =>
          setInitials((arr) =>
            arr.map((ch, i) => (i === cursor ? ALPHABET[(ALPHABET.indexOf(ch) + d + ALPHABET.length) % ALPHABET.length] : ch)),
          );
        if (e.key === "ArrowUp") cycle(-1);
        else if (e.key === "ArrowDown") cycle(1);
        else if (e.key === "ArrowLeft") setCursor((c) => Math.max(0, c - 1));
        else if (e.key === "ArrowRight") setCursor((c) => Math.min(2, c + 1));
        else if (e.key === "Enter") saveRecord();
        else if (/^[a-z0-9]$/i.test(e.key)) {
          setInitials((arr) => arr.map((ch, i) => (i === cursor ? e.key.toUpperCase() : ch)));
          setCursor((c) => Math.min(2, c + 1));
        } else return;
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, cursor, start, togglePause, saveRecord]);

  const shownScore = state === "over" || state === "record" ? finalScore : score;
  const shownLives = state === "over" || state === "record" ? 0 : lives;
  const level = String(Math.min(99, 1 + Math.floor(shownScore / 9000))).padStart(2, "0");

  const overlay = (
    <Overlay
      state={state}
      name={name}
      progress={progress}
      finalScore={finalScore}
      best={best}
      saved={saved}
      globalRecord={globalRecord}
      globalHolder={globalHolder}
      initials={initials}
      cursor={cursor}
      onStart={start}
      onResume={togglePause}
      onRestart={start}
      onSave={saveRecord}
      onPickSlot={setCursor}
      slug={slug}
    />
  );


  return (
    <div className="flex min-h-full flex-1 flex-col bg-deep">
      {/* Barra superior (escritorio) */}
      <div className="hidden h-[52px] items-center gap-5 border-b border-panel px-8 text-sm text-muted lg:flex">
        <Link href={`/juegos/${slug}`} className="text-cyan hover:text-text">← Salir</Link>
        <span className="font-pixel text-sm text-text lm-logo-glow">LA MAQUINITA</span>
        <span className="ml-auto">Modo foco · la navegación se oculta mientras juegas</span>
      </div>
      {/* Barra superior (móvil) */}
      <div className="flex h-11 items-center gap-3 px-4 text-sm lg:hidden">
        <Link href={`/juegos/${slug}`} aria-label="Salir" className="text-cyan">←</Link>
        <span className="font-pixel text-sm uppercase lm-logo-glow">{name}</span>
        <span className="ml-auto flex gap-2">
          <button type="button" onClick={togglePause} aria-label="Pausa" className="grid size-[34px] place-items-center rounded border border-line text-xs">II</button>
          <button type="button" onClick={() => setSound((v) => !v)} aria-label="Sonido" aria-pressed={sound} className={`grid size-[34px] place-items-center rounded border border-line text-xs ${sound ? "" : "text-muted line-through"}`}>♪</button>
        </span>
      </div>
      {/* HUD móvil */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2 font-mono lg:hidden">
        <span className="text-2xl text-gold">{fmtHud(shownScore)}</span>
        <Lives lives={shownLives} size={14} />
        <span className="text-[13px] text-cyan">LV {level}</span>
      </div>

      <div className="mx-auto w-full max-w-[1440px] lg:grid lg:grid-cols-[240px_1fr_240px] lg:items-center lg:gap-8 lg:px-12 lg:pb-14 lg:pt-10">
        {/* HUD izquierdo */}
        <div className="hidden flex-col gap-4 lg:flex">
          <HudBox label="PUNTUACIÓN">
            <span className="font-mono text-[34px] text-gold" style={{ textShadow: "0 0 12px rgba(255,214,10,.5)" }}>
              {fmtHud(shownScore)}
            </span>
          </HudBox>
          <HudBox label="VIDAS">
            <Lives lives={shownLives} size={22} />
          </HudBox>
          <HudBox label="NIVEL">
            <span className="font-pixel text-[28px] text-cyan">{level}</span>
          </HudBox>
        </div>

        {/* Cabina */}
        <div
          ref={cabinetRef}
          className="flex flex-col gap-[18px] lg:rounded-b-lg lg:rounded-t-[18px] lg:border-2 lg:border-line lg:px-7 lg:pb-7 lg:pt-5"
          style={{ background: "linear-gradient(180deg,#1A1033,#120B24)", boxShadow: "0 0 60px rgba(255,46,136,.18)" }}
        >
          <div
            className="hidden h-14 place-items-center rounded-md border-[1.5px] border-pink bg-ink font-pixel text-[26px] uppercase tracking-[2px] lg:grid"
            style={{ textShadow: "0 0 6px #FF2E88,0 0 20px rgba(255,46,136,.8)", boxShadow: "inset 0 0 20px rgba(255,46,136,.25)" }}
          >
            {name}
          </div>
          <div
            className="lm-stripes-dark relative mx-3 my-2 aspect-[3/4] overflow-hidden rounded-lg border-[6px] border-[#050509] lg:m-0 lg:aspect-[4/3] lg:rounded-[10px] lg:border-[10px]"
            style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,.9)" }}
          >
            {/* Aquí se monta el <canvas> del juego real */}
            <span className="absolute bottom-3 left-3.5 font-mono text-[11px] text-muted">
              canvas del juego{state === "playing" ? " · demo" : ""}
            </span>
            {overlay}
          </div>
          <div className="hidden justify-center gap-2.5 lg:flex">
            <CtrlButton onClick={togglePause} disabled={state !== "playing" && state !== "pause"}>II  Pausa</CtrlButton>
            <CtrlButton onClick={() => setSound((v) => !v)}>{`♪  Sonido${sound ? "" : " (off)"}`}</CtrlButton>
            <CtrlButton onClick={fullscreen}>⤢  Pantalla completa</CtrlButton>
            <CtrlButton onClick={start} disabled={state === "loading"}>↻  Reiniciar</CtrlButton>
          </div>
        </div>

        {/* HUD derecho */}
        <div className="hidden flex-col gap-4 lg:flex">
          <HudBox label="TU RÉCORD">
            <span className="font-mono text-[26px]">{fmtScore(best)}</span>
          </HudBox>
          <div className="flex flex-col gap-1.5 rounded-md border border-gold bg-ink p-5" style={{ boxShadow: "0 0 16px rgba(255,214,10,.2)" }}>
            <span className="font-mono text-[11px] tracking-[1.5px] text-muted">RÉCORD GLOBAL</span>
            <span className="font-mono text-[26px] text-gold">{globalRecord}</span>
            <span className="text-[13px] text-muted">{globalHolder}</span>
          </div>
          <div className="flex flex-col gap-2 rounded-md border border-line bg-ink p-5 text-[13px] text-muted">
            <span className="font-mono text-[11px] tracking-[1.5px]">CONTROLES</span>
            <span>← ↑ → ↓ mover</span>
            <span>ESPACIO disparar</span>
            <span>X escudo · P pausa</span>
          </div>
        </div>
      </div>

      {/* Controles táctiles (móvil) */}
      <TouchControls onA={state === "start" ? start : undefined} />
    </div>
  );
}

function CtrlButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 items-center gap-2 whitespace-pre rounded border border-line bg-ink px-[18px] text-sm font-medium hover:border-cyan hover:text-cyan disabled:opacity-40 disabled:hover:border-line disabled:hover:text-text"
    >
      {children}
    </button>
  );
}

function HudBox({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-ink p-5">
      <span className="font-mono text-[11px] tracking-[1.5px] text-muted">{label}</span>
      {children}
    </div>
  );
}

function Lives({ lives, size }: { lives: number; size: number }) {
  return (
    <div className="flex gap-2" aria-label={`${Math.max(0, lives)} vidas`}>
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            background: i < lives ? "#FF3B3B" : "#2A2347",
            clipPath: "polygon(50% 0,100% 100%,50% 78%,0 100%)",
          }}
        />
      ))}
    </div>
  );
}

function Overlay(p: {
  state: State;
  name: string;
  progress: number;
  finalScore: number;
  best: number;
  saved: boolean;
  globalRecord: string;
  globalHolder: string;
  initials: string[];
  cursor: number;
  slug: string;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSave: () => void;
  onPickSlot: (i: number) => void;
}) {
  const base = "absolute inset-0 flex flex-col items-center justify-center text-center px-4";
  switch (p.state) {
    case "loading":
      return (
        <div className={`${base} gap-5 bg-deep`} role="status">
          <span className="font-pixel text-xl text-cyan lg:text-[28px]">CARGANDO</span>
          <div className="flex h-[22px] w-full max-w-[360px] gap-[3px] border-2 border-cyan p-[3px]">
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className="flex-1" style={{ background: i < p.progress ? "#00E5FF" : "transparent" }} />
            ))}
          </div>
          <span className="font-mono text-xs text-muted lg:text-[13px]">
            Consejo: el escudo (X) se recarga recogiendo chatarra.
          </span>
        </div>
      );
    case "start":
      return (
        <button type="button" onClick={p.onStart} className={`${base} gap-7 bg-deep/60`}>
          <span className="font-pixel text-[32px] uppercase leading-none lm-neon-pink lg:text-[56px]">{p.name}</span>
          <Blink className="font-pixel text-lg text-gold lg:text-[26px]">PRESS START</Blink>
          <span className="font-mono text-xs text-muted lg:text-sm">
            Récord global {p.globalRecord} · {p.globalHolder}
          </span>
        </button>
      );
    case "pause":
      return (
        <div className={`${base} gap-4 bg-deep/[.82]`}>
          <span className="mb-3 font-pixel text-[40px] text-cyan lg:text-5xl" style={{ textShadow: "0 0 20px rgba(0,229,255,.7)" }}>
            PAUSA
          </span>
          <button type="button" onClick={p.onResume} autoFocus className="lm-btn-primary h-[52px] w-full max-w-[280px] rounded font-bold">
            ▶ Continuar
          </button>
          <button type="button" onClick={p.onRestart} className="lm-btn-ghost h-[52px] w-full max-w-[280px] rounded font-semibold">
            Reiniciar
          </button>
          <Link href={`/juegos/${p.slug}`} className="grid h-[52px] w-full max-w-[280px] place-items-center font-medium text-muted hover:text-text">
            Salir al detalle
          </Link>
        </div>
      );
    case "over": {
      const diff = p.best - p.finalScore;
      return (
        <div className={`${base} gap-5 bg-deep/[.85]`}>
          <span className="font-pixel text-[40px] text-danger lg:text-[64px]" style={{ textShadow: "0 0 8px #FF3B3B,0 0 30px rgba(255,59,59,.7)" }}>
            GAME OVER
          </span>
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-[13px] tracking-[2px] text-muted">PUNTUACIÓN FINAL</span>
            <span className="font-mono text-4xl text-gold lg:text-5xl">{fmtScore(p.finalScore)}</span>
            <span className="text-sm text-muted">
              {p.saved
                ? "¡Récord guardado!"
                : `Tu récord: ${fmtScore(p.best)} · te faltaron ${fmtScore(Math.max(0, diff))}`}
            </span>
          </div>
          <div className="mt-2 flex gap-3">
            <button type="button" onClick={p.onRestart} autoFocus className="lm-btn-primary h-[52px] rounded px-7 font-bold">
              ↻ Reintentar
            </button>
            <Link href={`/juegos/${p.slug}`} className="lm-btn-ghost grid h-[52px] place-items-center rounded px-6 font-semibold">
              Salir
            </Link>
          </div>
          <Blink className="font-pixel text-sm text-gold">INSERT COIN TO CONTINUE</Blink>
        </div>
      );
    }
    case "record":
      return (
        <div className={`${base} gap-[22px] bg-deep/[.85]`}>
          <span className="lm-pulse font-pixel text-[28px] text-gold lg:text-[44px]">¡NUEVO RÉCORD!</span>
          <span className="font-mono text-4xl text-lime lg:text-[52px]" style={{ textShadow: "0 0 16px rgba(57,255,20,.6)" }}>
            {fmtScore(p.finalScore)}
          </span>
          <span className="text-[15px] text-muted">Ingresa tus iniciales</span>
          <div className="flex gap-3.5">
            {p.initials.map((ch, i) => {
              const on = i === p.cursor;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => p.onPickSlot(i)}
                  aria-label={`Inicial ${i + 1}: ${ch}`}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="text-xs" style={{ color: on ? "#FFD60A" : "#2A2347" }}>▲</span>
                  <span
                    className={`grid h-[76px] w-16 place-items-center rounded border-2 bg-ink font-pixel text-[40px] ${on && ch === "_" ? "lm-blink" : ""}`}
                    style={{ borderColor: on ? "#FFD60A" : "#2A2347", boxShadow: on ? "0 0 16px rgba(255,214,10,.5)" : "none" }}
                  >
                    {ch}
                  </span>
                  <span className="text-xs" style={{ color: on ? "#FFD60A" : "#2A2347" }}>▼</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={p.onSave}
            className="h-12 rounded bg-lime px-7 font-bold text-ink"
            style={{ boxShadow: "0 0 20px rgba(57,255,20,.5)" }}
          >
            Guardar récord
          </button>
        </div>
      );
    default:
      return null;
  }
}

function TouchControls({ onA }: { onA?: () => void }) {
  // TODO: conectar a la entrada del motor del juego.
  const pad = "grid place-items-center border-[1.5px] border-cyan bg-line text-cyan active:bg-cyan active:text-ink";
  return (
    <div className="flex items-center justify-between px-7 pb-8 pt-6 lg:hidden">
      <div className="grid grid-cols-[repeat(3,48px)] grid-rows-[repeat(3,48px)]">
        <span />
        <button type="button" aria-label="Arriba" className={`${pad} rounded-t-md`}>▲</button>
        <span />
        <button type="button" aria-label="Izquierda" className={`${pad} rounded-l-md`}>◀</button>
        <span className="bg-line" />
        <button type="button" aria-label="Derecha" className={`${pad} rounded-r-md`}>▶</button>
        <span />
        <button type="button" aria-label="Abajo" className={`${pad} rounded-b-md`}>▼</button>
        <span />
      </div>
      <div className="flex items-end gap-4">
        <button
          type="button"
          aria-label="B · escudo"
          className="grid size-[60px] place-items-center rounded-full border-2 border-cyan bg-line font-pixel text-xl text-cyan"
          style={{ boxShadow: "inset 0 -4px 0 rgba(0,0,0,.4)" }}
        >
          B
        </button>
        <button
          type="button"
          aria-label="A · disparar"
          onClick={onA}
          className="mb-6 grid size-[72px] place-items-center rounded-full bg-pink font-pixel text-2xl text-ink active:translate-y-[3px]"
          style={{ boxShadow: "0 0 22px rgba(255,46,136,.6),inset 0 -5px 0 rgba(0,0,0,.3)" }}
        >
          A
        </button>
      </div>
    </div>
  );
}
