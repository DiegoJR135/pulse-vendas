// components/ChannelsCard.jsx
import { MessageCircle, Instagram, Megaphone, Leaf, Flame } from "lucide-react";

const ICONS = { whatsapp: MessageCircle, instagram: Instagram, ads: Megaphone, organico: Leaf };
const COLORS = {
  whatsapp: "linear-gradient(90deg, #34e89e, #0bab64)",
  instagram: "linear-gradient(90deg, #a879ff, #7c3aed)",
  ads: "linear-gradient(90deg, #22d3ee, #0891b2)",
  organico: "linear-gradient(90deg, #d4d4e8, #8b86a8)",
};

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function ChannelsCard({ channels }) {
  if (!channels.length) {
    return (
      <div className="glass-card flex-1 rounded-3xl p-6">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Canais de venda</span>
        <p className="mt-4 text-sm text-[var(--muted)]">Aguardando a primeira venda do dia...</p>
      </div>
    );
  }

  const hottest = [...channels].sort((a, b) => b.percent - a.percent)[0];

  return (
    <div className="glass-card flex-1 rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Canais de venda</span>
        <span className="tag-pill flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-[var(--violet-400)]">
          <Flame className="h-3 w-3" />
          {hottest.name}
        </span>
      </div>

      <div className="space-y-4">
        {channels.map((ch) => {
          const Icon = ICONS[ch.id] || Leaf;
          const gradient = COLORS[ch.id] || COLORS.organico;
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
                <div className="channel-fill h-full rounded-full" style={{ width: `${ch.percent}%`, background: gradient }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
