"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { EngineEvents, EngineHandle } from "@/lib/games/ladrillazo";

/**
 * Motores reales disponibles para la pantalla de juego. Cada uno se carga solo en el navegador y
 * solo en la pantalla de su juego. Contrato: specs/002-arkanoid-integration/contracts/engine.md
 */

export type EngineKey = "ladrillazo";

export type EngineCanvasProps = {
  events: EngineEvents;
  onHandle(handle: EngineHandle | null): void;
};

export const engines: Record<
  EngineKey,
  { Canvas: ComponentType<EngineCanvasProps>; credit?: string }
> = {
  ladrillazo: {
    Canvas: dynamic(() => import("./LadrillazoCanvas"), { ssr: false }),
    credit: "Gráficos: Petraheim",
  },
};
