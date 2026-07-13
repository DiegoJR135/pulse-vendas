// components/TickerBanner.jsx
import { Zap } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function TickerBanner({ sales }) {
  if (!sales.length) return null;
  const items = sales.slice(0, 8);
  const loop = [...items, ...items];

  return (
    <div className="mx-10 mb-6 flex items-stretch overflow-hidden rounded-full border border-[var(--panel-border)] bg-[var(--bg-void-2)]">
      <div className="flex flex-shrink-0 items-center gap-2 rounded-full bg-[var(--green-600)] px-5 py-2.5">
        <Zap className="h-3.5 w-3.5 text-white" fill="white" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">Ao vivo</span>
      </div>
      <div className="flex flex-1 items-center overflow-hidden pl-5">
        <div className="ticker-track flex items-center gap-8 whitespace-nowrap py-2.5">
          {loop.map((sale, i) => (
            <span key={`${sale.id}-${i}`} className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-white">{sale.seller.name}</span>
              <span className="text-[var(--muted)]">fechou</span>
              <span className="text-money-glow font-bold">{formatCurrency(sale.value)}</span>
              <span className="text-[var(--muted)]">via {sale.channel}</span>
              <span className="mx-1 text-[var(--muted-dim)]">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
