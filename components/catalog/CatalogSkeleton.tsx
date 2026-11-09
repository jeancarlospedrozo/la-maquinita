/** Estado de carga del catálogo (M2 · "Estado de carga"). */
export function CatalogSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5 lg:p-12" aria-busy="true" aria-label="Cargando juegos">
      <div className="h-8 w-48 rounded-sm bg-panel lg:h-11" />
      <div className="h-12 rounded bg-panel lg:h-14" />
      <span className="mt-4 font-mono text-[11px] tracking-[1.5px] text-muted">CARGANDO…</span>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="lm-scan aspect-square rounded lg:aspect-[16/10]" />
      <div className="h-3 w-4/5 rounded-sm bg-panel" />
      <div className="h-2.5 w-1/2 rounded-sm bg-panel" />
    </div>
  );
}
