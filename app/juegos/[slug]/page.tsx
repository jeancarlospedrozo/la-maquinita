import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FavShareButtons, GameLeaderboard } from "@/components/detail/DetailClient";
import { SiteShell } from "@/components/SiteShell";
import { BadgeTag, Chip, Placeholder } from "@/components/ui";
import { achievements, currentPlayer, games, getGame } from "@/lib/data";

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/juegos/[slug]">): Promise<Metadata> {
  const game = getGame((await params).slug);
  return game ? { title: game.name, description: game.tagline } : {};
}

export default async function GameDetailPage({ params }: PageProps<"/juegos/[slug]">) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const similar = [
    ...games.filter((g) => g.category === game.category && g.slug !== game.slug),
    ...games.filter((g) => g.category !== game.category),
  ].slice(0, 4);

  return (
    <SiteShell active="juegos">
      <nav aria-label="Migas de pan" className="hidden gap-2.5 px-12 pt-6 text-sm text-muted lg:flex">
        <Link href="/juegos" className="text-cyan hover:text-text">Juegos</Link>/
        <Link href={`/juegos?cat=${encodeURIComponent(game.category)}`} className="text-cyan hover:text-text">
          {game.category}
        </Link>
        /<span className="text-text">{game.name}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1.6fr_1fr] lg:gap-10 lg:px-12 lg:pt-6">
        {/* Tráiler */}
        <div className="lm-stripes-lg grid aspect-video place-items-center lg:rounded-md lg:border lg:border-line">
          <div className="flex flex-col items-center gap-3.5">
            <span
              className="grid size-14 place-items-center rounded-full border-2 border-cyan text-cyan lg:size-[72px] lg:text-2xl"
              style={{ boxShadow: "0 0 20px rgba(0,229,255,.5)" }}
            >
              ▶
            </span>
            <span className="hidden bg-ink px-2.5 py-1.5 font-mono text-xs text-muted lg:inline">tráiler 30 s / gif</span>
          </div>
        </div>

        {/* Info + CTA */}
        <div className="flex flex-col gap-4 p-5 lg:gap-[22px] lg:p-0">
          <div className="flex flex-wrap gap-2">
            {game.badge && <BadgeTag badge={game.badge} />}
            <Chip>{game.category}</Chip>
            <span className="hidden gap-2 lg:flex">
              <Chip>{game.players}</Chip>
              <Chip>Dificultad {game.difficulty.toLowerCase()}</Chip>
            </span>
          </div>
          <h1 className="font-pixel text-4xl leading-none uppercase lm-neon-pink lg:text-[56px]">{game.name}</h1>
          <dl className="flex gap-6 font-mono lg:gap-8">
            <Stat value={`★ ${game.rating}`} label={`${game.votes} votos`} />
            <Stat value={game.plays} label="partidas" />
            <Stat value={currentPlayer.best} label="tu mejor" gold />
          </dl>
          <Link
            href={`/juegos/${game.slug}/jugar`}
            className="lm-btn-primary flex h-[60px] items-center justify-center gap-3 rounded-md font-pixel text-2xl lg:h-[72px] lg:text-[28px]"
          >
            ▶ JUGAR
          </Link>
          <FavShareButtons slug={game.slug} name={game.name} />

          {/* Controles */}
          <div className="hidden flex-col gap-3.5 rounded-md border border-line bg-panel p-5 lg:flex">
            <span className="font-mono text-xs tracking-[1.5px] text-muted">CONTROLES</span>
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 text-sm">
              <div className="flex gap-1">
                {["←", "↑", "↓", "→"].map((k) => (
                  <Key key={k} color="#00E5FF">{k}</Key>
                ))}
              </div>
              <span>Mover la nave</span>
              <Key color="#FF2E88" wide>ESPACIO</Key>
              <span>Disparar</span>
              <div className="flex gap-1">
                <Key color="#FFD60A">X</Key>
                <Key color="#A59FC7">P</Key>
              </div>
              <span>Escudo · Pausa</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 rounded-md border border-line bg-panel p-4 lg:hidden">
            <DPadIcon />
            <span className="text-sm leading-[1.4] text-muted">Táctil: D-pad para mover, A disparar, B escudo.</span>
          </div>

          <div className="lg:hidden">
            <GameLeaderboard short />
          </div>
        </div>
      </div>

      {/* Sobre el juego + leaderboard */}
      <div className="hidden grid-cols-[1.6fr_1fr] gap-10 px-12 pt-14 lg:grid">
        <div className="flex flex-col gap-5">
          <h2 className="font-pixel text-2xl">Sobre el juego</h2>
          <p className="max-w-[720px] text-[17px] leading-[1.65] text-pretty text-muted">{game.description}</p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <Placeholder key={n} label={`captura ${n}`} className="aspect-[16/10] rounded border border-line" />
            ))}
          </div>
          <h2 className="mt-6 font-pixel text-2xl">Logros disponibles</h2>
          <div className="grid grid-cols-4 gap-4">
            {achievements.map((a) => {
              const c = a.locked ? "#A59FC7" : "#39FF14";
              return (
                <div
                  key={a.name}
                  className="flex flex-col gap-2.5 rounded-md border border-line bg-panel p-[18px]"
                  style={{ opacity: a.locked ? 0.45 : 1 }}
                >
                  <span
                    className="grid size-11 place-items-center rounded border-2 font-pixel text-base"
                    style={{ borderColor: c, color: c, boxShadow: a.locked ? "none" : "0 0 12px rgba(57,255,20,.45)" }}
                  >
                    {a.icon}
                  </span>
                  <span className="text-[15px] font-semibold">{a.name}</span>
                  <span className="text-[13px] leading-[1.4] text-muted">{a.desc}</span>
                  {a.locked && <span className="sr-only">Bloqueado</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="self-start rounded-md border border-line bg-panel p-6">
          <GameLeaderboard />
        </div>
      </div>

      {/* Similares */}
      <section className="hidden flex-col gap-6 px-12 pb-16 pt-14 lg:flex">
        <h2 className="font-pixel text-2xl">Juegos similares</h2>
        <div className="grid grid-cols-4 gap-6">
          {similar.map((g) => (
            <Link
              key={g.slug}
              href={`/juegos/${g.slug}`}
              className="flex items-center gap-3.5 rounded-md border border-line bg-panel p-3 transition-colors hover:border-cyan"
            >
              <div
                className="size-[72px] flex-none rounded"
                style={{ background: "repeating-linear-gradient(135deg,#1A1033 0 8px,#2A2347 8px 16px)" }}
              />
              <div className="flex flex-col gap-[3px]">
                <span className="text-[15px] font-semibold">{g.name}</span>
                <span className="text-xs text-muted">{g.category}</span>
                <span className="font-mono text-[13px] text-gold">{g.record}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ value, label, gold }: { value: string; label: string; gold?: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="hidden font-sans text-xs text-muted lg:block">{label}</dt>
      <dd className={`text-[15px] lg:text-xl ${gold ? "text-gold" : ""}`}>
        {value}
        <span className="lg:hidden">{label === "partidas" ? " partidas" : ""}</span>
      </dd>
    </div>
  );
}

function Key({ children, color, wide }: { children: ReactNode; color: string; wide?: boolean }) {
  return (
    <kbd
      className={`lm-key grid h-[30px] place-items-center font-mono ${wide ? "w-[134px] text-xs" : "w-[30px] text-[13px]"}`}
      style={{ borderColor: color, color }}
    >
      {children}
    </kbd>
  );
}

function DPadIcon() {
  const cells = [0, 1, 0, 1, 2, 1, 0, 1, 0];
  return (
    <div className="grid grid-cols-[repeat(3,18px)] grid-rows-[repeat(3,18px)]" aria-hidden>
      {cells.map((c, i) => (
        <span key={i} className={c === 1 ? "bg-cyan" : c === 2 ? "bg-line" : ""} />
      ))}
    </div>
  );
}
