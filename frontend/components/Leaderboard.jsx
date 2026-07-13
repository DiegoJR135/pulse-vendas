// components/Leaderboard.jsx
import { Crown } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function Leaderboard({ sellers }) {
  return (
    <div className="glass-card min-w-0 p-6">
      <span className="mb-5 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Ranking geral
      </span>

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
                  <p className="text-[10px] text-[var(--muted-dim)]">{s.deals} vendas</p>
                </div>

                <p className="text-money-glow flex-shrink-0 text-sm font-bold">{formatCurrency(s.total)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
