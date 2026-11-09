"use client";

import { useEffect, useState } from "react";
import { pad2 } from "@/lib/data";

const LABELS = ["DÍAS", "HORAS", "MIN", "SEG"] as const;

function parts(target: number, now: number) {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
}

export function Countdown({ endsAt, compact = false }: { endsAt: string; compact?: boolean }) {
  const target = new Date(endsAt).getTime();
  // null durante el prerender: se rellena en el cliente para evitar desajustes de hidratación.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reloj en cliente
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const values = now === null ? null : parts(target, now);

  return (
    <div className={`flex ${compact ? "gap-2" : "gap-3"}`} role="timer" aria-label="Tiempo restante del torneo">
      {LABELS.map((label, i) => (
        <div
          key={label}
          className={`flex flex-col items-center bg-ink ${
            compact ? "flex-1 rounded-[3px] py-2" : "w-[82px] gap-1 rounded border border-line py-3"
          }`}
        >
          <span className={`font-mono text-gold ${compact ? "text-xl" : "text-[32px]"}`}>
            {values ? pad2(values[i]) : "--"}
          </span>
          <span className={`text-muted ${compact ? "text-[10px]" : "text-[11px] tracking-[1px]"}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}
