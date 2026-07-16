// components/RevenueCard.jsx
import { TrendingUp, Target } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// A meta aqui é por QUANTIDADE DE INGRESSOS vendidos (pagos + convidados),
// não mais por valor em R$ — mas o número grande em destaque continua
// mostrando a receita total acumulada, só a barrinha/meta embaixo mudou.
export default function RevenueCard({ revenue, ticketsCurrent, ticketsTarget }) {
  const percent = Math.min(100, Math.round((ticketsCurrent / ticketsTarget) * 100));
  const missing = Math.max(ticketsTarget - ticketsCurrent, 0);

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          <TrendingUp className="h-4 w-4 text-[var(--green-400)]" />
          Receita total
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px] font-medium text-[var(--muted)]">
          <Target className="h-3 w-3" />
          Meta {ticketsTarget} ingressos
        </span>
      </div>

      <p key={revenue} className="animate-value-pop font-headline text-money-glow text-5xl leading-none tracking-tight">
        {formatCurrency(revenue)}
      </p>

      <div className="mt-5">
        <div className="progress-track h-2.5 w-full overflow-hidden rounded-full">
          <div className="progress-fill h-full rounded-full" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-2.5 flex justify-between font-mono text-[10px] font-medium text-[var(--muted)]">
          <span>{ticketsCurrent} / {ticketsTarget} ingressos ({percent}%)</span>
          <span>Faltam {missing} ingresso{missing === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
