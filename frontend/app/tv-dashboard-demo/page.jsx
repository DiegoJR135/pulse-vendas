// app/tv-dashboard-demo/page.jsx
//
// Tela de DEMONSTRAÇÃO (uso interno) — visualmente igual à tela real
// (/tv-dashboard), mas com 88 vendas de ingresso fictícias somadas às
// vendas reais só aqui, geradas no navegador (não grava nada no
// backend/banco). Existe pra testar/mostrar internamente como o painel
// fica com bastante volume de vendas, sem misturar com os dados reais
// que o Rafa acompanha na tela principal.
//
// Mantém um indicador discreto (não é a barra amarela chamativa) — só
// pra quem souber que é a tela de teste confirmar isso, sem virar um
// elemento gritante na apresentação.
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
import { FlaskConical } from "lucide-react";

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
      <Header isOnline={isOnline} />

      {/* Indicador discreto de que é a tela de teste (uso interno) — um
          selinho pequeno no canto, sem cor chamativa, integrado ao tema
          escuro da página em vez de uma faixa de alerta. */}
      <div className="tag-pill pointer-events-none absolute right-6 top-6 z-10 flex items-center gap-1.5 px-3 py-1 opacity-70">
        <FlaskConical className="h-3 w-3 text-[var(--muted-dim)]" />
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--muted-dim)]">
          Teste interno
        </span>
      </div>

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
