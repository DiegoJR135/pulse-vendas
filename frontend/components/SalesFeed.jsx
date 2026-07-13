// components/SalesFeed.jsx
import { Bot, Pencil } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function SalesFeed({ sales }) {
  return (
    <div className="glass-card flex min-h-0 flex-1 flex-col p-6">
      <span className="mb-4 block flex-shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Histórico
      </span>

      {sales.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhuma venda anterior ainda.</p>
      ) : (
        <div className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {sales.map((sale) => (
            <div key={sale.id} className="flex items-start justify-between gap-3 border-b border-[var(--panel-border)] pb-3 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{sale.seller.name}</p>
                <p className="truncate text-xs text-[var(--muted)]">Cliente: {sale.client}</p>
                <p className="truncate text-[10px] text-[var(--muted-dim)]">{sale.product}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-money-glow text-sm font-bold">{formatCurrency(sale.value)}</p>
                <div className="mt-0.5 flex items-center justify-end gap-1 text-[9px] text-[var(--muted-dim)]">
                  {sale.origin === "automatico" ? <Bot className="h-2.5 w-2.5" /> : <Pencil className="h-2.5 w-2.5" />}
                  {formatTime(sale.datetime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
