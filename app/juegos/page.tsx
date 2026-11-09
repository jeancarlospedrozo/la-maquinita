import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog/Catalog";
import { CatalogSkeleton } from "@/components/catalog/CatalogSkeleton";
import { SiteShell } from "@/components/SiteShell";
import { categories, type Category } from "@/lib/data";

export const metadata: Metadata = { title: "Catálogo" };

export default function JuegosPage({ searchParams }: PageProps<"/juegos">) {
  return (
    <SiteShell active="juegos">
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogFromParams searchParams={searchParams} />
      </Suspense>
    </SiteShell>
  );
}

async function CatalogFromParams({ searchParams }: Pick<PageProps<"/juegos">, "searchParams">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;
  const initialCategory = categories.some((c) => c.name === cat) ? (cat as Category) : undefined;
  // `key` reinicia el estado del cliente cuando cambia la URL (p. ej. buscar desde la barra).
  return <Catalog key={`${q}|${cat ?? ""}`} initialQuery={q} initialCategory={initialCategory} />;
}
