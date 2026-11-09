import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { Blink } from "@/components/ui";

export default function NotFound() {
  return (
    <SiteShell active="home">
      <div className="flex flex-col items-center gap-6 px-5 py-24 text-center">
        <span className="font-pixel text-6xl text-danger lg:text-8xl" style={{ textShadow: "0 0 24px rgba(255,59,59,.6)" }}>
          404
        </span>
        <span className="font-pixel text-xl">GAME OVER</span>
        <p className="text-muted">Esta pantalla no existe. ¿Volvemos al inicio?</p>
        <Link href="/" className="lm-btn-primary flex h-12 items-center rounded px-6 font-bold">
          ▶ Volver al inicio
        </Link>
        <Blink className="font-pixel text-sm text-gold">INSERT COIN TO CONTINUE</Blink>
      </div>
    </SiteShell>
  );
}
