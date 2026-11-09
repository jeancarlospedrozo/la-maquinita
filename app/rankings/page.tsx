import type { Metadata } from "next";
import { RankingsView } from "@/components/rankings/RankingsView";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = { title: "Rankings" };

export default function RankingsPage() {
  return (
    <SiteShell active="rankings">
      <RankingsView />
    </SiteShell>
  );
}
