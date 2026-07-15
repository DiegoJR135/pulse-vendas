// app/tv-dashboard-demo/page.jsx
//
// Tela de DEMONSTRAÇÃO — visualmente igual à tela real (/tv-dashboard),
// mas com 88 vendas de ingresso fictícias somadas às vendas reais só
// aqui, geradas no navegador (não grava nada no backend/banco). Existe
// pra testar como o painel fica com bastante volume de vendas, sem
// misturar com os dados reais que o Rafa acompanha na tela principal.
//
// Por isso tem a faixa "DADOS DE TESTE" fixa no topo — pra nunca ser
// confundida com o painel real.
"use client";

import Header from "@/components/Header";
import TickerBanner from "@/components/TickerBanner";
import RevenueCard from "@/components/RevenueCard";
import ChannelsCard from "@/components/ChannelsCard";
import MentoriaGoalsCard from "@/components/MentoriaGoalsCard";
import FeaturedSale from "@/components/FeaturedSale";
import Leaderboard from "@/components/Leaderboard";
import SalesFeed from "@/components/SalesFeed";
import { useDemoSalesFeed } from "@/lib/useDemoSalesFeed";
import { AlertTriangle } from "lucide-react";

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

export default function TvDashboardDemoPage() {
  const { data, isOnline } = useDemoSalesFeed();

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      {/* Faixa de aviso — fixa, não dá pra tirar navegando/scrollando */}
      <div className="flex flex-shrink-0 items-center justify-center gap-2 bg-amber-500 py-1.5 text-black">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-[0.2em]">
          Dados de teste — tela de demonstração, não reflete o painel real
        </span>
      </div>

      <Header isOnline={isOnline} />
      <TickerBanner sales={buildTickerSales(data)} />

      <main className="grid min-h-0 flex-1 grid-cols-12 gap-6 px-10 pb-8">
        <section className="col-span-3 flex min-h-0 min-w-0 flex-col gap-6 overflow-y-auto scrollbar-thin">
          <RevenueCard
            revenue={data.dailyGoal.current}
            ticketsCurrent={data.ticketsGoal.current}
            ticketsTarget={data.ticketsGoal.target}
          />
          <MentoriaGoalsCard mentoriaGoal={data.mentoriaGoal} meetingsGoal={data.meetingsGoal} />
          <ChannelsCard channels={data.channels} />
        </section>

        <section className="col-span-6 min-h-0 min-w-0">
          <FeaturedSale sale={data.lastSale} />
        </section>

        <section className="col-span-3 flex min-h-0 min-w-0 flex-col gap-6">
          <Leaderboard
            volumeAll={data.leaderboardVolumeAll}
            volumePaid={data.leaderboardVolumePaid}
            revenue={data.leaderboardRevenue}
          />
          <SalesFeed sales={data.salesFeed} mentoriaHistory={data.mentoriaHistory} />
        </section>
      </main>

      <div className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] text-[var(--muted-dim)]">
        modo demonstração — 88 vendas de teste somadas às vendas reais, só nesta tela
      </div>
    </div>
  );
}
