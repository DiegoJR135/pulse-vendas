// components/SalesFeed.jsx
"use client";

import { useMemo, useState } from "react";
import { Bot, Pencil, CalendarClock, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

// Mostra dia + hora — sem o dia, fica impossível saber QUANDO a venda
// aconteceu de fato (principalmente na mentoria, que vem de datas digitadas
// manualmente na planilha e podem ser de qualquer dia, não só hoje).
function formatDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

function monthKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const TABS = [
  { key: "ingressos", label: "Histórico" },
  { key: "mentoria", label: "Histórico Mentoria" },
];

export default function SalesFeed({ sales, mentoriaHistory = [] }) {
  const [tab, setTab] = useState("ingressos");
  const [month, setMonth] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const availableMonths = useMemo(() => {
    const keys = new Set(mentoriaHistory.map((item) => monthKey(item.datetime)));
    return Array.from(keys).sort((a, b) => (a < b ? 1 : -1));
  }, [mentoriaHistory]);

  const filteredMentoria = useMemo(() => {
    if (month === "all") return mentoriaHistory;
    return mentoriaHistory.filter((item) => monthKey(item.datetime) === month);
  }, [mentoriaHistory, month]);

  const items = tab === "ingressos" ? sales : filteredMentoria;

  async function handleDelete(item) {
    const rawId = String(item.id).replace("mentoria-", "");
    if (!window.confirm(`Excluir "${item.type === "meeting" ? "reunião" : "venda"}" de ${item.client}?`)) return;
    setDeletingId(item.id);
    try {
      await fetch(`${API_URL}/api/mentoria/${rawId}`, { method: "DELETE" });
      // não precisa atualizar o estado local — o backend publica o snapshot
      // novo via SSE assim que apaga, e o painel atualiza sozinho.
    } catch {
      // se falhar, o item continua na lista — a pessoa pode tentar de novo
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="glass-card flex min-h-0 flex-1 flex-col p-6">
      <div className="mb-3 flex flex-shrink-0 flex-wrap items-center gap-1.5">
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

        {tab === "mentoria" && availableMonths.length > 0 && (
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="ml-auto rounded-full border border-[var(--panel-border)] bg-transparent px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)] outline-none"
          >
            <option value="all">Todos os meses</option>
            {availableMonths.map((key) => (
              <option key={key} value={key}>
                {monthLabel(key)}
              </option>
            ))}
          </select>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {tab === "ingressos" ? "Nenhuma venda anterior ainda." : "Nenhuma venda ou reunião registrada nesse período."}
        </p>
      ) : tab === "ingressos" ? (
        <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
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
                  {formatDateTime(item.datetime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 border-b border-[var(--panel-border)] pb-3 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{item.seller.name}</p>
                <p className="truncate text-xs text-[var(--muted)]">Cliente: {item.client}</p>
                <p className="truncate text-[10px] text-[var(--muted-dim)]">
                  {item.type === "meeting" ? "Reunião agendada" : item.product} · {item.channel}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-start gap-2">
                <div className="text-right">
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
                    {formatDateTime(item.datetime)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  title="Excluir"
                  className="flex-shrink-0 rounded-lg p-1.5 text-[var(--muted-dim)] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
