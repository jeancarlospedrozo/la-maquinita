/**
 * Estado de carga de la pantalla de juego (modo foco, sin navegación del sitio).
 * Repite las clases del estado "loading" de GameScreen para que el cambio no se note.
 */
export function PlaySkeleton() {
  return (
    <div
      className="flex min-h-full flex-1 flex-col bg-deep"
      aria-busy="true"
      aria-label="Cargando juego"
    >
      {/* Barra superior (escritorio) */}
      <div className="hidden h-[52px] items-center gap-5 border-b border-panel px-8 text-sm text-muted lg:flex">
        <span className="h-[17px] w-14 rounded-sm bg-panel" />
        <span className="lm-logo-glow font-pixel text-sm text-text">
          LA MAQUINITA
        </span>
        <span className="ml-auto">
          Modo foco · la navegación se oculta mientras juegas
        </span>
      </div>
      {/* Barra superior y HUD (móvil) */}
      <div className="flex h-11 items-center gap-3 px-4 lg:hidden">
        <span className="h-4 w-28 rounded-sm bg-panel" />
      </div>
      <div className="h-12 px-4 py-2 lg:hidden">
        <div className="h-full w-32 rounded-sm bg-panel" />
      </div>

      <div className="mx-auto w-full max-w-[1440px] lg:grid lg:grid-cols-[240px_1fr_240px] lg:items-center lg:gap-8 lg:px-12 lg:pt-10 lg:pb-14">
        <div className="hidden flex-col gap-4 lg:flex">
          <SkeletonBox />
          <SkeletonBox />
          <SkeletonBox />
        </div>

        <div
          className="flex flex-col gap-[18px] lg:rounded-t-[18px] lg:rounded-b-lg lg:border-2 lg:border-line lg:px-7 lg:pt-5 lg:pb-7"
          style={{
            background: "linear-gradient(180deg,#1A1033,#120B24)",
            boxShadow: "0 0 60px rgba(255,46,136,.18)",
          }}
        >
          <div className="hidden h-14 rounded-md border-[1.5px] border-pink bg-ink lg:block" />
          <div
            className="relative mx-3 my-2 aspect-[3/4] overflow-hidden rounded-lg border-[6px] border-[#050509] lg:m-0 lg:aspect-[4/3] lg:rounded-[10px] lg:border-[10px]"
            style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,.9)" }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-deep px-4 text-center">
              <span className="font-pixel text-xl text-cyan lg:text-[28px]">
                CARGANDO
              </span>
              <div className="h-[22px] w-full max-w-[360px] border-2 border-cyan" />
            </div>
          </div>
          <div className="hidden h-11 lg:block" />
        </div>

        <div className="hidden flex-col gap-4 lg:flex">
          <SkeletonBox />
          <SkeletonBox />
          <SkeletonBox />
        </div>
      </div>
    </div>
  );
}

function SkeletonBox() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-ink p-5">
      <span className="h-3 w-20 rounded-sm bg-panel" />
      <span className="h-8 w-28 rounded-sm bg-panel" />
    </div>
  );
}
