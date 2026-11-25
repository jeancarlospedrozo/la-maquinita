import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GameScreen } from "@/components/game/GameScreen";
import { PlaySkeleton } from "@/components/game/PlaySkeleton";
import { currentPlayer, games, getControls, getGame, top5 } from "@/lib/data";

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/juegos/[slug]/jugar">): Promise<Metadata> {
  const game = getGame((await params).slug);
  return game ? { title: `Jugando ${game.name}` } : {};
}

export default function PlayPage({
  params,
}: PageProps<"/juegos/[slug]/jugar">) {
  // `params` se lee dentro de <Suspense>: al pulsar "Jugar", el marco de carga sale al instante.
  return (
    <Suspense fallback={<PlaySkeleton />}>
      <PlayFromParams params={params} />
    </Suspense>
  );
}

async function PlayFromParams({
  params,
}: Pick<PageProps<"/juegos/[slug]/jugar">, "params">) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const holder = top5.find((r) => r.game === game.name)?.name ?? "kaiser_88";

  return (
    <GameScreen
      slug={game.slug}
      name={game.name}
      globalRecord={game.record}
      globalHolder={game.recordHolder ?? holder}
      personalBest={game.personalBest ?? currentPlayer.best}
      engine={game.engine}
      controls={getControls(game)}
    />
  );
}
