// API pública del motor de Ladrillazo. Contrato: specs/002-arkanoid-integration/contracts/engine.md

export type EnginePhase =
  "idle" | "serving" | "playing" | "levelComplete" | "won" | "lost";

export type EngineStats = { score: number; lives: number; level: number };

export type EngineEvents = {
  /** Progreso de carga de los recursos; `total` ≥ 1. */
  onProgress(loaded: number, total: number): void;
  /** La hoja de sprites está lista; fase "idle". */
  onReady(): void;
  /** La hoja de sprites no cargó. Los sonidos nunca dan error. */
  onError(reason: "sprites"): void;
  onStats(stats: EngineStats): void;
  onPhase(phase: EnginePhase): void;
  /** Una vez por partida, al entrar en "won" o "lost". */
  onEnd(result: { score: number; won: boolean }): void;
};

export type EngineHandle = {
  /** idle → serving (nivel 1, 3 vidas, 0 puntos). No hace nada antes de onReady. */
  start(): void;
  /** Cualquier fase → serving, partida nueva; quita la pausa. */
  restart(): void;
  pause(): void;
  resume(): void;
  /** serving → lanza; levelComplete → siguiente nivel; en otra fase no hace nada. */
  action(): void;
  /** Dirección mantenida desde la cruceta táctil. */
  setDirection(d: -1 | 0 | 1): void;
  setMuted(muted: boolean): void;
  /** Tras onError: vuelve a cargar la hoja de sprites. */
  retryAssets(): void;
  /** Para el bucle, quita todos los listeners y los sonidos. Idempotente. */
  destroy(): void;
};

export { createLadrillazoEngine } from "./engine";
