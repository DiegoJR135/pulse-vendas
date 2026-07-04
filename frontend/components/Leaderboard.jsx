// components/Leaderboard.jsx
import { Crown } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function Leaderboard({ sellers }) {
  return (
    <div className="glass-card min-w-0 rounded-3xl p-6">
      <span className="mb-5 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Ranking do mês
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
                  isFirst ? "bg-gradient-to-r from-[var(--violet-600)]/25 to-transparent" : ""
                }`}
              >
                <span
                  className={`w-6 flex-shrink-0 text-center text-xl font-black ${
                    isFirst ? "text-[var(--violet-400)]" : "text-[var(--muted-dim)]"
                  }`}
                >
                  {s.rank}
                </span>

                <div className="relative flex-shrink-0">
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className={`h-11 w-11 rounded-full object-cover ${isFirst ? "border-2 border-[var(--violet-400)]" : "border border-white/10"}`}
                  />
                  {isFirst && <Crown className="absolute -top-2.5 left-1/2 h-4 w-4 -translate-x-1/2 text-[var(--violet-400)]" fill="currentColor" />}
                </div>

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
