import Link from "next/link";
import { currentPlayer } from "@/lib/data";

export type NavKey = "home" | "juegos" | "rankings" | "torneos" | "perfil";

const desktopItems: { key: NavKey; label: string; href: string }[] = [
  { key: "juegos", label: "Juegos", href: "/juegos" },
  { key: "rankings", label: "Rankings", href: "/rankings" },
  { key: "torneos", label: "Torneos", href: "/#torneo" },
];

const mobileTabs: { key: NavKey; label: string; href: string }[] = [
  { key: "home", label: "Inicio", href: "/" },
  { key: "juegos", label: "Juegos", href: "/juegos" },
  { key: "rankings", label: "Ranking", href: "/rankings" },
  { key: "torneos", label: "Torneos", href: "/#torneo" },
  { key: "perfil", label: "Perfil", href: "/rankings#tu-posicion" },
];

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="La Maquinita, inicio">
      <span
        className={`grid place-items-center rounded-full bg-gold font-pixel text-ink ${
          sm ? "size-5 text-[10px]" : "size-6 text-xs"
        }`}
        style={{ boxShadow: "0 0 14px rgba(255,214,10,.6)" }}
      >
        M
      </span>
      <span className={`font-pixel text-text lm-logo-glow ${sm ? "text-[15px]" : "text-xl tracking-[1px]"}`}>
        LA MAQUINITA
      </span>
    </Link>
  );
}

function SearchGlyph({ size = 12 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block rounded-full border-2 border-cyan"
      style={{ width: size, height: size }}
    />
  );
}

function Avatar({ size = 40 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded border-2 border-cyan bg-line font-pixel text-text"
      style={{
        width: size,
        height: size,
        fontSize: size > 38 ? 12 : 10,
        boxShadow: "0 0 10px rgba(0,229,255,.5)",
      }}
      aria-label={`Perfil de ${currentPlayer.handle}`}
    >
      P1
    </span>
  );
}

export function DesktopNav({ active, loggedIn = true }: { active: NavKey; loggedIn?: boolean }) {
  return (
    <header className="hidden h-[72px] items-center gap-10 border-b border-line bg-ink px-12 lg:flex">
      <Logo />
      <nav className="flex h-full gap-7">
        {desktopItems.map((it) => {
          const on = it.key === active;
          return (
            <Link
              key={it.key}
              href={it.href}
              aria-current={on ? "page" : undefined}
              className={`flex items-center border-b-2 text-[15px] font-medium transition-colors hover:text-cyan ${
                on ? "border-cyan text-cyan" : "border-transparent text-text"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <form action="/juegos" className="ml-auto flex h-10 max-w-[420px] flex-1 items-center gap-2.5 rounded border border-line bg-panel px-3.5 text-sm text-muted focus-within:border-cyan">
        <SearchGlyph />
        <input
          name="q"
          type="search"
          placeholder="Buscar juegos, jugadores…"
          className="h-full flex-1 bg-transparent text-text outline-none placeholder:text-muted"
        />
        <kbd className="rounded-[3px] border border-line px-1.5 py-0.5 font-mono text-[11px]">/</kbd>
      </form>
      {loggedIn ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-sm text-gold" title="Monedas">
            <span className="size-2.5 rounded-full bg-gold" style={{ boxShadow: "0 0 8px #FFD60A" }} />
            {currentPlayer.coins}
          </div>
          <Avatar />
        </div>
      ) : (
        <button className="lm-btn-ghost flex h-10 items-center rounded px-5 text-sm font-semibold">
          Iniciar sesión
        </button>
      )}
    </header>
  );
}

export function MobileTopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2.5 border-b border-line bg-ink px-4 lg:hidden">
      <Logo size="sm" />
      <Link
        href="/juegos"
        aria-label="Buscar"
        className="ml-auto grid size-9 place-items-center rounded border border-line"
      >
        <SearchGlyph />
      </Link>
      <Avatar size={36} />
    </header>
  );
}

export function MobileTabBar({ active }: { active: NavKey }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-line bg-ink pb-[env(safe-area-inset-bottom)] lg:hidden">
      {mobileTabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 text-[11px] font-medium ${
              on ? "text-cyan" : "text-muted"
            }`}
          >
            <span
              className="size-[18px] rounded-[3px] border-2 border-current"
              style={{ boxShadow: on ? "0 0 8px rgba(0,229,255,.7)" : "none" }}
            />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
