import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameScreen } from "@/components/game/GameScreen";
import { currentPlayer, games, getGame, top5 } from "@/lib/data";

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/juegos/[slug]/jugar">): Promise<Metadata> {
  const game = getGame((await params).slug);
  return game ? { title: `Jugando ${game.name}` } : {};
}

export default async function PlayPage({ params }: PageProps<"/juegos/[slug]/jugar">) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const holder = top5.find((r) => r.game === game.name)?.name ?? "kaiser_88";

  return (
    <GameScreen
      slug={game.slug}
      name={game.name}
      globalRecord={game.record}
      globalHolder={holder}
      personalBest={currentPlayer.best}
    />
  );
}
