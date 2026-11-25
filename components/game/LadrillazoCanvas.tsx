"use client";

import { useEffect, useRef } from "react";
import { createLadrillazoEngine } from "@/lib/games/ladrillazo";
import type { EngineCanvasProps } from "./engines";

/** Monta el motor de Ladrillazo en un canvas de 800×600 escalado por CSS. */
export default function LadrillazoCanvas({
  events,
  onHandle,
}: EngineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Los callbacks se leen a través de refs para crear el motor una sola vez.
  const eventsRef = useRef(events);
  const onHandleRef = useRef(onHandle);
  useEffect(() => {
    eventsRef.current = events;
    onHandleRef.current = onHandle;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const proxy: EngineCanvasProps["events"] = {
      onProgress: (l, t) => eventsRef.current.onProgress(l, t),
      onReady: () => eventsRef.current.onReady(),
      onError: (r) => eventsRef.current.onError(r),
      onStats: (s) => eventsRef.current.onStats(s),
      onPhase: (p) => eventsRef.current.onPhase(p),
      onEnd: (r) => eventsRef.current.onEnd(r),
    };
    const handle = createLadrillazoEngine(canvas, proxy);
    onHandleRef.current(handle);
    return () => {
      handle.destroy();
      onHandleRef.current(null);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      aria-label="Juego Ladrillazo"
      className="block size-full bg-black object-contain [image-rendering:pixelated]"
    />
  );
}
