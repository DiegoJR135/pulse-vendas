// app/tv-dashboard/page.jsx
"use client";

import Header from "@/components/Header";
import TickerBanner from "@/components/TickerBanner";
import RevenueCard from "@/components/RevenueCard";
import ChannelsCard from "@/components/ChannelsCard";
import FeaturedSale from "@/components/FeaturedSale";
import Leaderboard from "@/components/Leaderboard";
import SalesFeed from "@/components/SalesFeed";
import { useSalesFeed } from "@/lib/useSalesFeed";

export default function TvDashboardPage() {
  const { data, isOnline, isSimulated } = useSalesFeed();

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <Header isOnline={isOnline} />
      <TickerBanner sales={[data.lastSale, ...data.salesFeed].filter(Boolean)} />

      <main className="grid min-h-0 flex-1 grid-cols-12 gap-6 px-10 pb-8">
        {/* Coluna esquerda */}
        <section className="col-span-3 flex min-h-0 min-w-0 flex-col gap-6">
          <RevenueCard current={data.dailyGoal.current} target={data.dailyGoal.target} />
          <ChannelsCard channels={data.channels} />
        </section>

        {/* Coluna central — protagonista absoluto */}
        <section className="col-span-6 min-h-0 min-w-0">
          <FeaturedSale sale={data.lastSale} />
        </section>

        {/* Coluna direita */}
        <section className="col-span-3 flex min-h-0 min-w-0 flex-col gap-6">
          <Leaderboard sellers={data.leaderboard} />
          <SalesFeed sales={data.salesFeed} />
        </section>
      </main>

      {isSimulated && (
        <div className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] text-[var(--muted-dim)]">
          modo simulador — dados fake a cada 10s (troque NEXT_PUBLIC_USE_SIMULATOR=false pra conectar no backend real)
        </div>
      )}
    </div>
  );
}
