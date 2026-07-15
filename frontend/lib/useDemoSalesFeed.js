// lib/useDemoSalesFeed.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { generateFakeTickets } from "./generateFakeTickets";
import { buildDemoSnapshot } from "./buildDemoSnapshot";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Snapshot vazio (mesmo formato do useSalesFeed real) — evita quebrar a UI
// enquanto o fetch inicial não voltou.
const EMPTY_SNAPSHOT = {
  dailyGoal: { current: 0, target: 250000 },
  ticketsGoal: { current: 0, target: 150 },
  mentoriaGoal: { current: 0, target: 5 },
  meetingsGoal: { current: 0, target: 8 },
  mentoriaHistory: [],
  channels: [],
  lastSale: null,
  salesFeed: [],
  leaderboard: [],
  leaderboardVolumeAll: [],
  leaderboardVolumePaid: [],
  leaderboardRevenue: [],
  updatedAt: null,
};

// Hook exclusivo da tela de demonstração (/tv-dashboard-demo). Busca o
// snapshot REAL uma única vez, só pra LER (GET, sem nenhuma escrita), e
// soma por cima 88 vendas de ingresso fictícias geradas no navegador.
// Não abre conexão SSE, não recebe atualizações do backend em tempo real
// e não grava nada — é uma foto do real + dados de teste, montada localmente.
export function useDemoSalesFeed() {
  const [realSnapshot, setRealSnapshot] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const fakeTickets = useMemo(() => generateFakeTickets(88), []);

  useEffect(() => {
    let cancelled = false;
    async function fetchInitialSnapshot() {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`);
        if (!res.ok) throw new Error("falha ao buscar snapshot real");
        const snapshot = await res.json();
        if (!cancelled) {
          setRealSnapshot(snapshot);
          setIsOnline(true);
        }
      } catch {
        if (!cancelled) setIsOnline(false);
      }
    }
    fetchInitialSnapshot();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    if (!realSnapshot) return EMPTY_SNAPSHOT;
    return buildDemoSnapshot(realSnapshot, fakeTickets);
  }, [realSnapshot, fakeTickets]);

  return { data, isOnline, isSimulated: false };
}
