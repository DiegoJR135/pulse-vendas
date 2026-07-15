// lib/buildDemoSnapshot.js
//
// Pega o snapshot REAL (vindo do backend, sem alterar nada nele) e soma
// as vendas de teste (fictícias) só pra montar o estado da tela de
// demonstração. Espelha a mesma lógica de agregação do backend
// (app/cache.py), mas roda 100% no navegador — nenhuma escrita é feita
// no Postgres nem no Redis reais.
//
// Importante: a meta/histórico/rankings da MENTORIA (Diamond Sales) não
// são tocados aqui — só os ingressos do MVW recebem os dados de teste,
// como foi pedido.

const CHANNEL_ID_MAP = { WhatsApp: "whatsapp", Instagram: "instagram", Ads: "ads", "Orgânico": "organico", "QR Code": "qrcode" };

function buildSellerTotals(tickets) {
  const totals = {};
  for (const t of tickets) {
    const key = t.seller.name;
    if (!totals[key]) totals[key] = { name: t.seller.name, avatar: t.seller.avatar, total: 0, deals: 0 };
    totals[key].total += t.value;
    totals[key].deals += 1;
  }
  return totals;
}

function rank(totals, sortKey, limit = 5) {
  return Object.values(totals)
    .sort((a, b) => b[sortKey] - a[sortKey])
    .slice(0, limit)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

export function buildDemoSnapshot(realSnapshot, fakeTickets) {
  const realTickets = (realSnapshot.salesFeed || []).filter((s) => s.kind !== "mentoria");
  const combinedTickets = [...realTickets, ...fakeTickets].sort(
    (a, b) => new Date(b.datetime) - new Date(a.datetime)
  );

  // ---------- Canais: soma os valores dos ingressos de teste em cima do
  // que já veio real (que já inclui ingressos reais + mentoria real) ----------
  const channelTotals = {};
  for (const ch of realSnapshot.channels || []) channelTotals[ch.name] = ch.value;
  for (const t of fakeTickets) channelTotals[t.channel] = (channelTotals[t.channel] || 0) + t.value;
  const channelSum = Object.values(channelTotals).reduce((a, b) => a + b, 0) || 1;
  const channels = Object.entries(channelTotals)
    .map(([name, value]) => ({
      id: CHANNEL_ID_MAP[name] || name.toLowerCase(),
      name,
      value,
      percent: Math.round((value / channelSum) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  // ---------- Leaderboards: só ingressos contam (igual ao backend) ----------
  const paidTickets = combinedTickets.filter((t) => t.value > 0);
  const totalsAll = buildSellerTotals(combinedTickets);
  const totalsPaid = buildSellerTotals(paidTickets);

  const leaderboardVolumeAll = rank(totalsAll, "deals");
  const leaderboardVolumePaid = rank(totalsPaid, "deals");
  const leaderboardRevenue = rank(totalsPaid, "total");

  // ---------- Última venda: a mais recente entre ingressos (real + teste)
  // e a última venda de mentoria real (reuniões não contam como venda) ----------
  const candidateLastSale =
    realSnapshot.lastSale && realSnapshot.lastSale.kind === "mentoria" ? realSnapshot.lastSale : null;
  let lastSale = combinedTickets[0] || null;
  if (candidateLastSale && (!lastSale || new Date(candidateLastSale.datetime) > new Date(lastSale.datetime))) {
    lastSale = candidateLastSale;
  }

  const revenue = combinedTickets.reduce((sum, t) => sum + t.value, 0);

  return {
    ...realSnapshot,
    dailyGoal: { ...realSnapshot.dailyGoal, current: revenue },
    ticketsGoal: { ...realSnapshot.ticketsGoal, current: combinedTickets.length },
    channels,
    lastSale,
    salesFeed: combinedTickets.slice(0, 300),
    leaderboardVolumeAll,
    leaderboardVolumePaid,
    leaderboardRevenue,
    leaderboard: leaderboardRevenue,
    updatedAt: new Date().toISOString(),
  };
}
