// components/FeaturedSale.jsx
import { Bot, Pencil } from "lucide-react";

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function FeaturedSale({ sale }) {
  if (!sale) {
    return (
      <div className="glass-card flex h-full flex-col items-center justify-center p-10 text-center">
        <p className="font-headline text-3xl text-[var(--muted)]">Aguardando a primeira venda...</p>
        <p className="mt-3 text-sm text-[var(--muted-dim)]">Assim que fechar, ela aparece aqui automaticamente.</p>
      </div>
    );
  }

  const isAuto = sale.origin === "automatico";

  return (
    <div key={sale.id} className="glass-card flex h-full flex-col items-center justify-between px-10 py-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--green-400)]">Última venda fechada</p>

      <div className="flex flex-1 flex-col items-center justify-center">
        {sale.kind === "mentoria" && (
          <span className="tag-pill mb-3 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--green-400)]">
            Diamond Sales — Mentoria
          </span>
        )}
        <p key={sale.id} className="animate-value-pop font-headline text-money-glow text-[6.5rem] leading-[0.9] tracking-tight xl:text-[7.5rem]">
          {formatCurrency(sale.value)}
        </p>
        <p className="mt-4 max-w-xl truncate text-2xl font-medium text-white/90">{sale.product}</p>
      </div>

      <div className="flex w-full flex-col items-center gap-5">
        <div>
          <p className="truncate text-2xl font-bold text-white">{sale.seller.name}</p>
          <p className="truncate text-sm text-[var(--muted)]">Cliente: {sale.client}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="tag-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            {sale.channel}
          </span>
          <span className="tag-pill flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            {isAuto ? <Bot className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {isAuto ? "Automático" : "Manual"}
          </span>
        </div>
      </div>
    </div>
  );
}
