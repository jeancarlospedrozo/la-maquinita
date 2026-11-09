import Link from "next/link";
import type { ReactNode } from "react";
import type { Badge, Game } from "@/lib/data";

export function Blink({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`lm-blink ${className}`}>{children}</span>;
}

export function BadgeTag({ badge, className = "" }: { badge: Badge; className?: string }) {
  return (
    <span
      className={`font-mono text-[11px] font-bold text-ink ${className}`}
      style={{ background: badge.color, padding: "3px 7px" }}
    >
      {badge.label}
    </span>
  );
}

export function Placeholder({
  label,
  className = "",
  variant = "sm",
}: {
  label?: string;
  className?: string;
  variant?: "sm" | "lg" | "dark";
}) {
  const bg = variant === "lg" ? "lm-stripes-lg" : variant === "dark" ? "lm-stripes-dark" : "lm-stripes";
  return (
    <div className={`${bg} grid place-items-center ${className}`}>
      {label && <span className="font-mono text-[11px] text-muted">{label}</span>}
    </div>
  );
}

export function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h2 className={`font-pixel text-lg lg:text-[28px] ${className}`}>{children}</h2>;
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line px-2.5 py-[3px] text-xs text-muted">{children}</span>
  );
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className = "",
  itemClassName = "flex-1",
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div role="tablist" className={`flex gap-1 rounded p-1 text-sm font-medium ${className}`}>
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            role="tab"
            type="button"
            aria-selected={on}
            onClick={() => onChange(o)}
            className={`${itemClassName} rounded-[3px] px-2 py-2 text-center transition-colors ${
              on ? "bg-line text-cyan" : "text-muted hover:text-text"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Tarjeta de juego (Home "Populares" y Catálogo). */
export function GameCard({ game, fav = false }: { game: Game; fav?: boolean }) {
  return (
    <Link
      href={`/juegos/${game.slug}`}
      className="lm-card group flex flex-col overflow-hidden rounded-md border border-line bg-panel"
    >
      <div className="lm-stripes relative grid aspect-[16/10] place-items-center">
        <span className="font-mono text-[11px] text-muted">miniatura</span>
        {game.badge && <BadgeTag badge={game.badge} className="absolute left-2.5 top-2.5" />}
        <div className="absolute inset-0 hidden place-items-center bg-ink/70 group-hover:grid group-focus-visible:grid">
          <span className="lm-btn-primary flex h-11 items-center rounded px-[22px] font-bold">▶ Jugar</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center">
          <span className="text-base font-semibold lg:text-[17px]">{game.name}</span>
          <span
            className="ml-auto text-lg"
            style={{ color: fav ? "#FF2E88" : "#A59FC7" }}
            aria-label={fav ? "En favoritos" : undefined}
          >
            {fav ? "♥" : "♡"}
          </span>
        </div>
        <span className="text-[13px] text-muted">{game.category}</span>
        <div className="mt-1.5 flex justify-between border-t border-line pt-2.5 text-xs text-muted">
          Récord
          <span className="font-mono text-sm text-gold">{game.record}</span>
        </div>
      </div>
    </Link>
  );
}

export function PlayerInitials({ initials, size = 36, highlight = false }: { initials: string; size?: number; highlight?: boolean }) {
  return (
    <span
      className={`grid flex-none place-items-center rounded bg-line font-pixel ${highlight ? "border-2 border-cyan" : ""}`}
      style={{ width: size, height: size, fontSize: size >= 36 ? 10 : 9 }}
    >
      {initials}
    </span>
  );
}
