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
        {/* Logo MVW */}
        <img src="/logo-mvw.png" alt="MVW" className="h-14 w-auto flex-shrink-0" />
        <div className="leading-tight">
          <h1 className="font-headline text-2xl tracking-tight text-white">MVW</h1>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
            Servidor de vendas
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="tag-pill flex items-center gap-2 px-4 py-2">
          <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-[var(--money)]" : "bg-red-500"}`} />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {isOnline ? "Ao vivo" : "Reconectando"}
          </span>
        </div>

        <div className="text-right leading-none">
          <p className="font-headline text-6xl tabular-nums tracking-tight text-white">{time}</p>
          <p className="mt-1.5 font-mono text-xs font-medium uppercase tracking-[0.15em] text-[var(--muted)]">{date}</p>
        </div>
      </div>
    </header>
  );
}
