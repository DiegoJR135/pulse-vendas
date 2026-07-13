// components/Leaderboard.jsx
"use client";

import { useState } from "react";
import { Crown } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

const TABS = [
  { key: "volumeAll", label: "Volume (com convidados)" },
  { key: "volumePaid", label: "Volume (pagas)" },
  { key: "revenue", label: "Faturamento" },
];

export default function Leaderboard({ volumeAll = [], volumePaid = [], revenue = [] }) {
  const [tab, setTab] = useState("revenue");

  const datasets = { volumeAll, volumePaid, revenue };
  const sellers = datasets[tab];
  // Nas abas de volume, o número que mais importa é a quantidade de vendas;
  // na de faturamento, é o valor em R$. Cada aba destaca a métrica certa.
  const primaryMetric = tab === "revenue" ? (s) => formatCurrency(s.total) : (s) => `${s.deals} venda${s.deals === 1 ? "" : "s"}`;
  const secondaryMetric = tab === "revenue" ? (s) => `${s.deals} venda${s.deals === 1 ? "" : "s"}` : (s) => formatCurrency(s.total);

  return (
    <div className="glass-card min-w-0 p-6">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              tab === t.key
                ? "bg-[var(--green-600)] text-white"
                : "border border-[var(--panel-border)] text-[var(--muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sellers.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Ninguém vendeu ainda.</p>
      ) : (
        <div className="space-y-3">
          {sellers.map((s) => {
            const isFirst = s.rank === 1;
            return (
              <div
                key={s.rank}
                className={`flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 ${
                  isFirst ? "bg-[var(--green-900)]/40" : ""
                }`}
              >
                <span
                  className={`w-6 flex-shrink-0 text-center text-xl font-bold ${
                    isFirst ? "text-[var(--green-400)]" : "text-[var(--muted-dim)]"
                  }`}
                >
                  {s.rank}
                </span>

                {isFirst && <Crown className="h-4 w-4 flex-shrink-0 text-[var(--green-400)]" fill="currentColor" />}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{s.name}</p>
                  <p className="text-[10px] text-[var(--muted-dim)]">{secondaryMetric(s)}</p>
                </div>

                <p className="text-money-glow flex-shrink-0 text-sm font-bold">{primaryMetric(s)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
