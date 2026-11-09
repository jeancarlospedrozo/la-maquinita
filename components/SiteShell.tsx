import Link from "next/link";
import type { ReactNode } from "react";
import { DesktopNav, MobileTabBar, MobileTopNav, type NavKey } from "./Nav";
import { Blink } from "./ui";
import { CrtToggle } from "./CrtToggle";

export function SiteShell({
  active,
  loggedIn,
  children,
}: {
  active: NavKey;
  loggedIn?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DesktopNav active={active} loggedIn={loggedIn} />
      <MobileTopNav />
      <main className="mx-auto w-full max-w-[1440px] flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileTabBar active={active} />
    </div>
  );
}

function Footer() {
  const cols = [
    { title: "PORTAL", links: [["Juegos", "/juegos"], ["Rankings", "/rankings"], ["Torneos", "/#torneo"], ["Cómo funciona", "#"]] },
    { title: "AYUDA", links: [["FAQ", "#"], ["Contacto", "#"], ["Discord", "#"], ["YouTube", "#"]] },
    { title: "LEGAL", links: [["Términos", "#"], ["Privacidad", "#"], ["Cookies", "#"]] },
  ];
  return (
    <footer className="hidden border-t border-line bg-foot lg:block">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 p-12">
        <div className="flex flex-col gap-3.5">
          <span className="font-pixel text-xl lm-logo-glow">LA MAQUINITA</span>
          <Blink className="font-pixel text-sm text-gold">INSERT COIN TO CONTINUE</Blink>
          <CrtToggle />
        </div>
        {cols.map((c) => (
          <div key={c.title} className="flex flex-col gap-2.5 text-sm">
            <span className="text-xs tracking-[1px] text-muted">{c.title}</span>
            {c.links.map(([label, href]) => (
              <Link key={label} href={href} className="text-cyan hover:text-text">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
