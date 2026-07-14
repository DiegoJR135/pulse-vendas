// components/SalesFeed.jsx
"use client";

import { useState } from "react";
import { Bot, Pencil, CalendarClock } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const TABS = [
  { key: "ingressos", label: "Histórico" },
  { key: "mentoria", label: "Histórico Mentoria" },
];

export default function SalesFeed({ sales, mentoriaHistory = [] }) {
  const [tab, setTab] = useState("ingressos");
  const items = tab === "ingressos" ? sales : mentoriaHistory;

  return (
    <div className="glass-card flex min-h-0 flex-1 flex-col p-6">
      <div className="mb-4 flex flex-shrink-0 flex-wrap gap-1.5">
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

      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {tab === "ingressos" ? "Nenhuma venda anterior ainda." : "Nenhuma venda ou reunião registrada ainda."}
        </p>
      ) : (
        <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {items.map((item) =>
            tab === "ingressos" ? (
              <div key={item.id} className="flex items-start justify-between gap-3 border-b border-[var(--panel-border)] pb-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.seller.name}</p>
                  <p className="truncate text-xs text-[var(--muted)]">Cliente: {item.client}</p>
                  <p className="truncate text-[10px] text-[var(--muted-dim)]">{item.product}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-money-glow text-sm font-bold">{formatCurrency(item.value)}</p>
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[9px] text-[var(--muted-dim)]">
                    {item.origin === "automatico" ? <Bot className="h-2.5 w-2.5" /> : <Pencil className="h-2.5 w-2.5" />}
                    {formatTime(item.datetime)}
                  </div>
                </div>
              </div>
            ) : (
              <div key={item.id} className="flex items-start justify-between gap-3 border-b border-[var(--panel-border)] pb-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.seller.name}</p>
                  <p className="truncate text-xs text-[var(--muted)]">Cliente: {item.client}</p>
                  <p className="truncate text-[10px] text-[var(--muted-dim)]">
                    {item.type === "meeting" ? "Reunião agendada" : item.product} · {item.channel}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  {item.type === "meeting" ? (
                    <p className="flex items-center justify-end gap-1 text-sm font-bold text-[var(--green-400)]">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Reunião
                    </p>
                  ) : (
                    <p className="text-money-glow text-sm font-bold">{formatCurrency(item.value)}</p>
                  )}
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[9px] text-[var(--muted-dim)]">
                    {item.origin === "automatico" ? <Bot className="h-2.5 w-2.5" /> : <Pencil className="h-2.5 w-2.5" />}
                    {formatTime(item.datetime)}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
