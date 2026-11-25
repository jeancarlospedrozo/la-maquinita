/**
 * Estado de carga de la ficha de un juego. Copia la estructura y las alturas de
 * app/juegos/[slug]/page.tsx: el ancho de las columnas depende de la altura de la
 * columna de información (el tráiler es 16:9), así que mismas alturas = mismas columnas.
 */
export function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando juego">
      <div className="hidden items-center gap-2.5 px-12 pt-6 lg:flex">
        <div className="h-[17px] w-14 rounded-sm bg-panel" />
        <div className="h-[17px] w-20 rounded-sm bg-panel" />
        <div className="h-[17px] w-24 rounded-sm bg-panel" />
      </div>

      {/* La ficha real resuelve sus columnas en 956 px + el resto para la altura habitual de
          la columna de información (research R5); bloques vacíos no reproducen ese cálculo,
          así que aquí se fija el resultado. */}
      <div className="lg:grid lg:grid-cols-[956px_minmax(0,1fr)] lg:gap-10 lg:px-12 lg:pt-6">
        <div className="lm-stripes-lg grid aspect-video place-items-center self-start lg:rounded-md lg:border lg:border-line">
          <span className="size-14 rounded-full border-2 border-line lg:size-[72px]" />
        </div>

        <div className="flex flex-col gap-4 p-5 lg:gap-[22px] lg:p-0">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-sm bg-panel" />
            <div className="h-6 w-24 rounded-sm bg-panel" />
          </div>
          {/* Título: dos líneas, el caso más común */}
          <div className="flex flex-col gap-2 lg:gap-0">
            <div className="h-9 w-4/5 rounded-sm bg-panel lg:h-14" />
            <div className="h-9 w-1/2 rounded-sm bg-panel lg:h-14" />
          </div>
          <div className="flex h-[23px] gap-6 lg:h-[46px] lg:gap-8">
            <div className="w-16 rounded-sm bg-panel" />
            <div className="w-16 rounded-sm bg-panel" />
            <div className="w-16 rounded-sm bg-panel" />
          </div>
          <div className="lm-scan h-[60px] rounded-md lg:h-[72px]" />
          <div className="hidden h-11 gap-3 lg:flex">
            <div className="flex-1 rounded bg-panel" />
            <div className="flex-1 rounded bg-panel" />
          </div>
          <div className="hidden h-[186px] flex-col gap-3.5 rounded-md border border-line bg-panel p-5 lg:flex">
            <span className="font-mono text-xs tracking-[1.5px] text-muted">
              CARGANDO…
            </span>
          </div>
          <div className="h-[74px] rounded-md border border-line bg-panel lg:hidden" />
        </div>
      </div>

      <div className="hidden grid-cols-[1.6fr_1fr] gap-10 px-12 pt-14 lg:grid">
        <div className="flex flex-col gap-5">
          <div className="h-8 w-56 rounded-sm bg-panel" />
          <div className="h-[84px] max-w-[720px] rounded-sm bg-panel" />
        </div>
        <div className="h-[440px] rounded-md border border-line bg-panel" />
      </div>
    </div>
  );
}
