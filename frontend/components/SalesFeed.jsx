// components/SalesFeed.jsx
"use client";

import { useMemo, useState } from "react";
import { Bot, Pencil, CalendarClock, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// Mesma chave configurada no backend (ADMIN_API_KEY) — protege as exclusões
// pra que só o painel consiga apagar vendas, não qualquer requisição direta.
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });
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
  // Mês selecionado é independente por aba — filtrar um não deve resetar o outro.
  const [monthIngressos, setMonthIngressos] = useState("all");
  const [monthMentoria, setMonthMentoria] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const month = tab === "ingressos" ? monthIngressos : monthMentoria;
  const setMonth = tab === "ingressos" ? setMonthIngressos : setMonthMentoria;

  const availableMonthsIngressos = useMemo(() => {
    const keys = new Set(sales.map((item) => monthKey(item.datetime)));
    return Array.from(keys).sort((a, b) => (a < b ? 1 : -1));
  }, [sales]);

  const availableMonthsMentoria = useMemo(() => {
    const keys = new Set(mentoriaHistory.map((item) => monthKey(item.datetime)));
    return Array.from(keys).sort((a, b) => (a < b ? 1 : -1));
  }, [mentoriaHistory]);

  const availableMonths = tab === "ingressos" ? availableMonthsIngressos : availableMonthsMentoria;

  const filteredIngressos = useMemo(() => {
    if (monthIngressos === "all") return sales;
    return sales.filter((item) => monthKey(item.datetime) === monthIngressos);
  }, [sales, monthIngressos]);

  const filteredMentoria = useMemo(() => {
    if (monthMentoria === "all") return mentoriaHistory;
    return mentoriaHistory.filter((item) => monthKey(item.datetime) === monthMentoria);
  }, [mentoriaHistory, monthMentoria]);

  const items = tab === "ingressos" ? filteredIngressos : filteredMentoria;

  // Ingressos usam a tabela "sales" (id tipo "sale-15"), mentoria usa
  // "mentoria_events" (id tipo "mentoria-7") — endpoints e prefixo diferentes.
  async function handleDelete(item, kind) {
    const endpoint = kind === "mentoria" ? "mentoria" : "sale";
    const prefix = kind === "mentoria" ? "mentoria-" : "sale-";
    const rawId = String(item.id).replace(prefix, "");
    const nome = kind === "mentoria" && item.type === "meeting" ? "reunião" : "venda";
    if (!window.confirm(`Excluir ${nome} de ${item.client}? Essa ação não pode ser desfeita.`)) return;
    setDeletingId(item.id);
    try {
      await fetch(`${API_URL}/api/${endpoint}/${rawId}`, {
        method: "DELETE",
        headers: ADMIN_API_KEY ? { "x-api-key": ADMIN_API_KEY } : {},
      });
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

        {availableMonths.length > 0 && (
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
          {tab === "ingressos" ? "Nenhuma venda nesse período." : "Nenhuma venda ou reunião registrada nesse período."}
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
              <div className="flex flex-shrink-0 items-start gap-2">
                <div className="text-right">
                  <p className="text-money-glow text-sm font-bold">{formatCurrency(item.value)}</p>
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[9px] text-[var(--muted-dim)]">
                    {item.origin === "automatico" ? <Bot className="h-2.5 w-2.5" /> : <Pencil className="h-2.5 w-2.5" />}
                    {formatDateTime(item.datetime)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item, "ingressos")}
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
                  onClick={() => handleDelete(item, "mentoria")}
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
