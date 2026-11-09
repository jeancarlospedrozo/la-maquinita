import type { CSSProperties } from "react";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { SiteShell } from "@/components/SiteShell";
import { Blink, GameCard, Placeholder, PlayerInitials, SectionTitle } from "@/components/ui";
import {
  categories,
  categoryCounts,
  featuredGame,
  newReleases,
  popularGames,
  positionColor,
  pad2,
  top5,
  tournament,
} from "@/lib/data";

export default function Home() {
  const g = featuredGame;
  return (
    <SiteShell active="home">
      {/* HERO */}
      <section
        className="relative overflow-hidden px-5 py-7 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16 lg:px-12 lg:pb-24 lg:pt-20"
        style={{
          background:
            "radial-gradient(ellipse at 70% 40%,rgba(255,46,136,.18),transparent 60%),radial-gradient(ellipse at 20% 90%,rgba(0,229,255,.12),transparent 55%),#0B0B1A",
        }}
      >
        <div aria-hidden className="lm-grid-floor pointer-events-none absolute inset-x-0 bottom-0 hidden h-[200px] lg:block" />

        {/* Gameplay (arriba en móvil, a la derecha en escritorio) */}
        <div
          className="relative mb-[18px] rounded-md border-2 border-pink lg:order-2 lg:mb-0 lg:rounded-lg lg:bg-panel lg:p-3.5"
          style={{ boxShadow: "0 0 40px rgba(255,46,136,.35)" }}
        >
          <Placeholder variant="lg" label={`gameplay animado — ${g.name}`} className="aspect-[16/10] rounded" />
        </div>

        <div className="relative flex flex-col gap-[18px] lg:gap-7">
          <div className="flex items-center gap-2.5">
            <span className="hidden bg-pink px-2.5 py-[5px] font-mono text-xs font-bold text-ink lg:inline">HOT</span>
            <span className="font-mono text-[11px] tracking-[1px] text-muted lg:text-[13px]">
              JUEGO DESTACADO · {g.category.toUpperCase()}
            </span>
          </div>
          <h1 className="font-pixel text-[44px] leading-none lm-neon-pink lg:text-[88px] lg:leading-[.95]">
            {g.name.split(" ").map((w, i) => (
              <span key={i} className="lg:block">
                {w}{" "}
              </span>
            ))}
          </h1>
          <p className="max-w-[480px] text-[15px] leading-normal text-pretty text-muted lg:text-[19px] lg:leading-[1.55]">
            {g.tagline}
          </p>
          <div className="flex gap-2.5 lg:gap-4">
            <Link
              href={`/juegos/${g.slug}/jugar`}
              className="lm-btn-primary flex h-[52px] flex-1 items-center justify-center gap-2.5 rounded font-bold lg:h-14 lg:flex-none lg:px-8 lg:text-[17px]"
            >
              ▶ Jugar ahora
            </Link>
            <Link
              href="/juegos"
              className="lm-btn-ghost flex h-[52px] flex-1 items-center justify-center rounded font-semibold lg:h-14 lg:flex-none lg:px-7 lg:text-[17px]"
            >
              <span className="lg:hidden">Catálogo</span>
              <span className="hidden lg:inline">Ver catálogo</span>
            </Link>
          </div>
          <dl className="hidden gap-10 pt-2 lg:flex">
            <Stat value={g.record} label="Récord global" gold />
            <Stat value="312K" label="Partidas esta semana" />
            <Stat value={`★ ${g.rating}`} label="Valoración" />
          </dl>
        </div>
      </section>

      {/* POPULARES */}
      <section className="flex flex-col gap-3.5 pl-5 pt-3 lg:gap-6 lg:px-12 lg:pt-16">
        <div className="flex items-end gap-4">
          <SectionTitle>
            <span className="lg:hidden">Populares</span>
            <span className="hidden lg:inline">Populares esta semana</span>
          </SectionTitle>
          <span className="ml-auto hidden gap-2 lg:flex" aria-hidden>
            <span className="grid size-10 place-items-center rounded border border-line text-muted">←</span>
            <span className="grid size-10 place-items-center rounded border border-cyan text-cyan">→</span>
          </span>
        </div>
        {/* Móvil: carrusel horizontal */}
        <div className="flex gap-3 overflow-x-auto pr-5 lg:hidden">
          {popularGames.map((p) => (
            <Link key={p.slug} href={`/juegos/${p.slug}`} className="flex w-[150px] flex-none flex-col gap-2">
              <Placeholder className="aspect-square rounded border border-line" />
              <span className="text-sm font-semibold">{p.name}</span>
              <span className="font-mono text-xs text-gold">{p.record}</span>
            </Link>
          ))}
        </div>
        <div className="hidden grid-cols-4 gap-6 lg:grid">
          {popularGames.map((p) => (
            <GameCard key={p.slug} game={p} />
          ))}
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="flex flex-col gap-6 px-5 pt-7 lg:px-12 lg:pt-16">
        <SectionTitle className="hidden lg:block">Categorías</SectionTitle>
        <div className="flex flex-wrap gap-2 lg:grid lg:grid-cols-6 lg:gap-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/juegos?cat=${encodeURIComponent(c.name)}`}
              className="rounded-[3px] border border-l-[3px] border-line border-l-(color:--c) bg-panel px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-line lg:flex lg:flex-col lg:gap-1.5 lg:rounded lg:border-l lg:border-t-[3px] lg:border-l-line lg:border-t-(color:--c) lg:px-5 lg:py-[22px]"
              style={{ "--c": c.color } as CSSProperties}
            >
              <span className="lg:text-[17px] lg:font-semibold">{c.name}</span>
              <span className="hidden font-mono text-xs text-muted lg:block">{categoryCounts[c.name]} juegos</span>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP 5 + TORNEO */}
      <section className="flex flex-col-reverse gap-7 px-5 pt-7 lg:grid lg:grid-cols-2 lg:gap-6 lg:px-12 lg:pt-16">
        <div className="flex flex-col gap-1.5 lg:gap-4 lg:rounded-md lg:border lg:border-line lg:bg-panel lg:p-7">
          <div className="mb-1.5 flex items-center lg:mb-0">
            <h2 className="font-pixel text-lg lg:text-[22px]">Top 5 global</h2>
            <Link href="/rankings" className="ml-auto hidden text-sm font-medium text-cyan hover:text-text lg:inline">
              Ver ranking →
            </Link>
          </div>
          <ol>
            {top5.map((r, i) => (
              <li
                key={r.name}
                className="grid grid-cols-[28px_1fr_auto] items-center gap-2.5 border-b border-line py-2 lg:grid-cols-[40px_36px_1fr_auto] lg:gap-3.5 lg:py-2.5"
              >
                <span className="font-mono text-[13px] lg:text-[15px]" style={{ color: positionColor(i) }}>
                  {pad2(i + 1)}
                </span>
                <span className="hidden lg:block">
                  <PlayerInitials initials={r.initials} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium lg:text-[15px] lg:font-semibold">{r.name}</span>
                  <span className="hidden text-xs text-muted lg:block">{r.game}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {i === 0 && (
                    <Blink className="hidden bg-gold px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink lg:inline">
                      RÉCORD
                    </Blink>
                  )}
                  <span className="font-mono text-sm text-gold lg:text-[17px]">{r.score}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div
          id="torneo"
          className="relative flex scroll-mt-20 flex-col gap-3 rounded-md border-[1.5px] border-pink p-5 lg:gap-5 lg:p-9"
          style={{
            background: "linear-gradient(135deg,rgba(255,46,136,.22),rgba(0,229,255,.16)),#1A1033",
            boxShadow: "0 0 30px rgba(255,46,136,.2)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-lime" style={{ boxShadow: "0 0 10px #39FF14" }} />
            <span className="font-mono text-[11px] tracking-[1px] text-lime lg:text-[13px]">TORNEO ACTIVO</span>
          </div>
          <h2 className="font-pixel text-xl leading-[1.1] lg:text-4xl">
            <span className="lg:hidden">{tournament.shortName}</span>
            <span className="hidden lg:inline">
              Copa Ladrillazo
              <br />
              de Otoño
            </span>
          </h2>
          <p className="hidden text-base leading-normal text-muted lg:block">
            {tournament.entrants} inscritos · Premio: {tournament.prize}
          </p>
          <div className="lg:hidden">
            <Countdown endsAt={tournament.endsAt} compact />
          </div>
          <div className="hidden lg:block">
            <Countdown endsAt={tournament.endsAt} />
          </div>
          <button className="lm-btn-primary hidden h-12 items-center self-start rounded px-6 font-bold lg:flex">
            Inscribirse
          </button>
        </div>
      </section>

      {/* NUEVOS LANZAMIENTOS */}
      <section className="hidden flex-col gap-6 px-12 pb-20 pt-16 lg:flex">
        <SectionTitle>Nuevos lanzamientos</SectionTitle>
        <div className="grid grid-cols-6 gap-4">
          {newReleases.map((n) => (
            <Link key={n.slug} href={`/juegos/${n.slug}`} className="group flex flex-col gap-2.5">
              <Placeholder
                label="portada"
                className="lm-card aspect-square rounded border border-line group-hover:border-cyan"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{n.name}</span>
                <span className="text-xs text-muted">{n.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <div className="h-7 lg:hidden" />
    </SiteShell>
  );
}

function Stat({ value, label, gold = false }: { value: string; label: string; gold?: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className={`font-mono text-[22px] ${gold ? "text-gold" : "text-text"}`}>{value}</dd>
    </div>
  );
}
