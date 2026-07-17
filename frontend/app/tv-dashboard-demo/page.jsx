// app/tv-dashboard-demo/page.jsx
//
// Tela ÚNICA de uso interno com um alternador entre duas visões:
// "Dados 1" (mesmos dados da tela principal /tv-dashboard) e
// "Dados 2" (soma 88 vendas fictícias por cima dos dados reais,
// gerado no navegador, sem gravar nada no backend/banco).
//
// Abre sempre em "Dados 1" por padrão — a visão de teste só aparece
// se alguém trocar manualmente pra ela.
"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TickerBanner from "@/components/TickerBanner";
import RevenueCard from "@/components/RevenueCard";
import ChannelsCard from "@/components/ChannelsCard";
import MentoriaGoalsCard from "@/components/MentoriaGoalsCard";
import FeaturedSale from "@/components/FeaturedSale";
import Leaderboard from "@/components/Leaderboard";
import SalesFeed from "@/components/SalesFeed";
import { useSalesFeed } from "@/lib/useSalesFeed";
import { useDemoSalesFeed } from "@/lib/useDemoSalesFeed";

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

const VIEWS = [
  { key: "real", label: "Dados 1" },
  { key: "teste", label: "Dados 2" },
];

export default function TvDashboardDemoPage() {
  // Os dois hooks rodam sempre (não dá pra chamar hook condicionalmente) —
  // cada um cuida da sua própria fonte (SSE real / snapshot real + fake),
  // e só escolhemos qual dos dois resultados exibir conforme o botão ativo.
  const real = useSalesFeed();
  const teste = useDemoSalesFeed();

  // Abre sempre no real por padrão.
  const [view, setView] = useState("real");
  const isTeste = view === "teste";
  const { data, isOnline } = isTeste ? teste : real;

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <Header isOnline={isOnline} />

      {/* Alternador rápido entre as duas visões — canto inferior esquerdo,
          longe da logo, pra trocar em um clique. */}
      <div className="absolute bottom-4 left-10 z-10 flex gap-1.5">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              view === v.key
                ? "bg-[var(--green-600)] text-white"
                : "border border-[var(--panel-border)] text-[var(--muted)]"
            }`}
          >
            {v.label}
          </button>
        ))}
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
    </div>
  );
}
