// components/RevenueCard.jsx
import { TrendingUp, Target } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function RevenueCard({ current, target }) {
  const percent = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          <TrendingUp className="h-4 w-4 text-[var(--green-400)]" />
          Receita total
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] font-medium text-[var(--muted)]">
          <Target className="h-3 w-3" />
          Meta {formatCurrency(target)}
        </span>
      </div>

      <p key={current} className="animate-value-pop font-headline text-money-glow text-5xl leading-none tracking-tight">
        {formatCurrency(current)}
      </p>

      <div className="mt-5">
        <div className="progress-track h-2.5 w-full overflow-hidden rounded-full">
          <div className="progress-fill h-full rounded-full" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-2.5 flex justify-between font-mono text-[10px] font-medium text-[var(--muted)]">
          <span>{percent}% da meta batida</span>
          <span>Faltam {formatCurrency(Math.max(target - current, 0))}</span>
        </div>
      </div>
    </div>
  );
}
