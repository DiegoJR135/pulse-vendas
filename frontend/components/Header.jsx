// components/Header.jsx
"use client";

import { useEffect, useState } from "react";

const weekdays = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"];

export default function Header({ isOnline = true }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = now
    ? now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  const date = now
    ? `${weekdays[now.getDay()]} · ${now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`
    : "";

  return (
    <header className="flex items-center justify-between px-10 py-6">
      <div className="flex items-center gap-4">
        {/* Logo circular Grupo Nexus */}
        <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--violet-500)] via-[var(--violet-600)] to-[var(--violet-900)] shadow-[0_8px_30px_-6px_rgba(139,92,246,0.65)]">
          <span className="font-sans text-2xl font-black italic tracking-tighter text-white">X</span>
        </div>
        <div className="leading-tight">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">GRUPO NEXUS</h1>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
            Servidor de vendas
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="tag-pill flex items-center gap-2 px-4 py-2">
          <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-[var(--money)] shadow-[0_0_8px_var(--money-glow)]" : "bg-red-500"}`} />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {isOnline ? "Ao vivo" : "Reconectando"}
          </span>
        </div>

        <div className="text-right leading-none">
          <p className="bg-gradient-to-br from-white to-[var(--violet-50)] bg-clip-text text-6xl font-black tabular-nums tracking-tight text-transparent">
            {time}
          </p>
          <p className="mt-1.5 font-mono text-xs font-medium uppercase tracking-[0.15em] text-[var(--muted)]">{date}</p>
        </div>
      </div>
    </header>
  );
}
