// app/tv-dashboard/page.jsx
"use client";

import Header from "@/components/Header";
import TickerBanner from "@/components/TickerBanner";
import RevenueCard from "@/components/RevenueCard";
import ChannelsCard from "@/components/ChannelsCard";
import MentoriaGoalsCard from "@/components/MentoriaGoalsCard";
import FeaturedSale from "@/components/FeaturedSale";
import Leaderboard from "@/components/Leaderboard";
import SalesFeed from "@/components/SalesFeed";
import { useSalesFeed } from "@/lib/useSalesFeed";

// A faixa que passa embaixo do header é só um "ao vivo" chamativo — mostrar
// o histórico inteiro ali fica poluído e repete o que já está no card de
// Histórico. Pega só as 3 vendas mais recentes (sem repetir a mesma venda
// duas vezes, já que "salesFeed" agora inclui a mais recente também).
function buildTickerSales(data) {
  const merged = [data.lastSale, ...data.salesFeed].filter(Boolean);
  const seen = new Set();
  const unique = [];
  for (const sale of merged) {
    if (seen.has(sale.id)) continue;
    seen.add(sale.id);
    unique.push(sale);
  }
  return unique.slice(0, 3);
}

export default function TvDashboardPage() {
  const { data, isOnline, isSimulated } = useSalesFeed();

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <Header isOnline={isOnline} />
      <TickerBanner sales={buildTickerSales(data)} />

      <main className="grid min-h-0 flex-1 grid-cols-12 gap-6 px-10 pb-8">
        {/* Coluna esquerda */}
        <section className="col-span-3 flex min-h-0 min-w-0 flex-col gap-6 overflow-y-auto scrollbar-thin">
          <RevenueCard
            revenue={data.dailyGoal.current}
            ticketsCurrent={data.ticketsGoal.current}
            ticketsTarget={data.ticketsGoal.target}
          />
          <MentoriaGoalsCard mentoriaGoal={data.mentoriaGoal} meetingsGoal={data.meetingsGoal} />
          <ChannelsCard channels={data.channels} />
        </section>

        {/* Coluna central — protagonista absoluto */}
        <section className="col-span-6 min-h-0 min-w-0">
          <FeaturedSale sale={data.lastSale} />
        </section>

        {/* Coluna direita */}
        <section className="col-span-3 flex min-h-0 min-w-0 flex-col gap-6">
          <Leaderboard
            volumeAll={data.leaderboardVolumeAll}
            volumePaid={data.leaderboardVolumePaid}
            revenue={data.leaderboardRevenue}
          />
          <SalesFeed sales={data.salesFeed} mentoriaHistory={data.mentoriaHistory} />
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
