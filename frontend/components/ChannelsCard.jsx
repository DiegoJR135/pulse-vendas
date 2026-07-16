// components/ChannelsCard.jsx
import { MessageCircle, Instagram, Megaphone, Leaf, Flame } from "lucide-react";

const ICONS = { whatsapp: MessageCircle, instagram: Instagram, ads: Megaphone, organico: Leaf };
const COLORS = {
  whatsapp: "#25d366",
  instagram: "#4a9fd8",
  ads: "#e0a83e",
  organico: "#8696a0",
};

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function ChannelsCard({ channels }) {
  if (!channels.length) {
    return (
      <div className="glass-card flex-1 p-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Canais de venda</span>
        <p className="mt-4 text-sm text-[var(--muted)]">Aguardando a primeira venda...</p>
      </div>
    );
  }

  const hottest = [...channels].sort((a, b) => b.percent - a.percent)[0];

  return (
    <div className="glass-card flex-1 p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Canais de venda</span>
        <span className="tag-pill flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-[var(--green-400)]">
          <Flame className="h-3 w-3" />
          {hottest.name}
        </span>
      </div>

      <div className="space-y-4">
        {channels.map((ch) => {
          const Icon = ICONS[ch.id] || Leaf;
          const color = COLORS[ch.id] || COLORS.organico;
          return (
            <div key={ch.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-white">
                  <Icon className="h-4 w-4 text-[var(--muted)]" />
                  {ch.name}
                </span>
                <span className="font-mono text-xs font-bold text-white">{formatCurrency(ch.value)}</span>
              </div>
              <div className="channel-track h-2 w-full overflow-hidden rounded-full">
                <div className="channel-fill h-full rounded-full" style={{ width: `${ch.percent}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
