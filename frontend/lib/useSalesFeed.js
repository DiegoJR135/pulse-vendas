// lib/useSalesFeed.js
"use client";

import { useEffect, useRef, useState } from "react";

// URL do backend Python (FastAPI). Configure em .env.local:
// NEXT_PUBLIC_API_URL=http://localhost:8000
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Deixe "true" pra testar o layout sem precisar do backend Python rodando.
// Troque pra "false" (ou remova a env var) quando for conectar no servidor real.
const USE_SIMULATOR = process.env.NEXT_PUBLIC_USE_SIMULATOR !== "false";

const RECONNECT_DELAY_MS = 3000;
const SIMULATOR_INTERVAL_MS = 10000;
const DAILY_GOAL_TARGET = 250000;

// ---------- Simulador (só usado em dev, sem backend) ----------
const SIM_SELLERS = [
  { name: "Marina Souza", avatar: "https://i.pravatar.cc/150?img=47" },
  { name: "Diego Martins", avatar: "https://i.pravatar.cc/150?img=12" },
  { name: "Paula Nunes", avatar: "https://i.pravatar.cc/150?img=32" },
  { name: "Lucas Ferreira", avatar: "https://i.pravatar.cc/150?img=68" },
  { name: "Camila Rocha", avatar: "https://i.pravatar.cc/150?img=21" },
];
const SIM_PRODUCTS = [
  "Plano Black Anual — Consultoria Premium",
  "Pacote Essencial Trimestral",
  "Consultoria Avulsa",
  "Plano Black Semestral",
  "Pacote Essencial Mensal",
];
const SIM_CHANNELS = ["WhatsApp", "Instagram", "Ads", "Orgânico"];
const SIM_CLIENTS = ["Ricardo Almeida", "Fernanda Lima", "Bruno Castro", "Carlos Eduardo", "Juliana Prado", "Eduarda Reis"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildSnapshotFromHistory(history) {
  const current = history.reduce((acc, s) => acc + s.value, 0);

  const channelTotals = {};
  for (const s of history) channelTotals[s.channel] = (channelTotals[s.channel] || 0) + s.value;
  const channelSum = Object.values(channelTotals).reduce((a, b) => a + b, 0) || 1;
  const idMap = { WhatsApp: "whatsapp", Instagram: "instagram", Ads: "ads", "Orgânico": "organico" };
  const channels = Object.entries(channelTotals)
    .map(([name, value]) => ({ id: idMap[name] || name.toLowerCase(), name, value, percent: Math.round((value / channelSum) * 100) }))
    .sort((a, b) => b.value - a.value);

  const sellerTotals = {};
  for (const s of history) {
    const key = s.seller.name;
    if (!sellerTotals[key]) sellerTotals[key] = { name: key, avatar: s.seller.avatar, total: 0, deals: 0 };
    sellerTotals[key].total += s.value;
    sellerTotals[key].deals += 1;
  }
  const leaderboard = Object.values(sellerTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  return {
    dailyGoal: { current, target: DAILY_GOAL_TARGET },
    channels,
    lastSale: history[0] || null,
    salesFeed: history.slice(1, 8),
    leaderboard,
    updatedAt: new Date().toISOString(),
  };
}

function makeSimulatedSale() {
  return {
    id: `sim-${Date.now()}`,
    product: randomFrom(SIM_PRODUCTS),
    value: [990, 1200, 1890, 4590, 9800, 18900][Math.floor(Math.random() * 6)],
    seller: randomFrom(SIM_SELLERS),
    client: randomFrom(SIM_CLIENTS),
    datetime: new Date().toISOString(),
    channel: randomFrom(SIM_CHANNELS),
    origin: Math.random() > 0.4 ? "automatico" : "manual",
  };
}

// Estado inicial vazio e 100% determinístico — precisa ser IDÊNTICO no
// servidor (SSR) e no navegador (hidratação), senão o React acusa erro de
// hydration mismatch. Por isso ele nunca pode conter Math.random()/Date.now().
const EMPTY_SNAPSHOT = {
  dailyGoal: { current: 0, target: DAILY_GOAL_TARGET },
  channels: [],
  lastSale: null,
  salesFeed: [],
  leaderboard: [],
  updatedAt: null,
};

export function useSalesFeed() {
  const [data, setData] = useState(EMPTY_SNAPSHOT);
  const [isOnline, setIsOnline] = useState(true);
  const historyRef = useRef([]);

  useEffect(() => {
    // Tudo aqui dentro só roda no navegador, depois da hidratação —
    // então gerar dados aleatórios (simulador) ou abrir conexões (SSE)
    // aqui é seguro e não causa mismatch entre servidor e cliente.

    // ---------- Modo simulador: setInterval jogando vendas fake ----------
    if (USE_SIMULATOR) {
      // gera a primeira venda imediatamente, e depois uma a cada 10s
      historyRef.current = [makeSimulatedSale()];
      setData(buildSnapshotFromHistory(historyRef.current));

      const interval = setInterval(() => {
        const sale = makeSimulatedSale();
        historyRef.current = [sale, ...historyRef.current].slice(0, 20);
        setData(buildSnapshotFromHistory(historyRef.current));
        setIsOnline(true);
      }, SIMULATOR_INTERVAL_MS);
      return () => clearInterval(interval);
    }

    // ---------- Modo real: busca o snapshot atual, depois liga o SSE ----------
    let reconnectTimer;
    let es;
    let cancelled = false;

    // Sem isso, toda vez que a página carrega (ou dá refresh), ela começa
    // vazia e só mostra algo quando a PRÓXIMA venda chegar — as vendas que
    // já aconteceram e estão salvas no Postgres nunca voltam pra tela.
    // Busca o estado atual uma vez via REST antes de abrir o SSE, que a
    // partir daí só cuida das atualizações seguintes.
    async function fetchInitialSnapshot() {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`);
        if (!res.ok) return;
        const snapshot = await res.json();
        if (!cancelled) setData(snapshot);
      } catch {
        // sem sorte agora, o SSE ainda vai atualizar assim que uma venda chegar
      }
    }

    function connect() {
      es = new EventSource(`${API_URL}/api/dashboard/stream`);

      es.onopen = () => setIsOnline(true);

      es.onmessage = (event) => {
        try {
          const next = JSON.parse(event.data);
          setData(next);
          setIsOnline(true);
        } catch {
          // ignora keep-alives/mensagens malformadas
        }
      };

      es.onerror = () => {
        setIsOnline(false);
        es.close();
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    }

    fetchInitialSnapshot();
    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      es?.close();
    };
  }, []);

  return { data, isOnline, isSimulated: USE_SIMULATOR };
}
