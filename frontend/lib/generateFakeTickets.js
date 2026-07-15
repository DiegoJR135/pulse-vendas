// lib/generateFakeTickets.js
//
// Gera vendas de ingresso FICTÍCIAS só pra popular a tela de demonstração
// (/tv-dashboard-demo). Não grava nada no backend/banco — é só um array
// gerado no navegador e somado aos dados reais na hora de montar o
// snapshot dessa tela específica. A tela original (/tv-dashboard) nunca
// vê esses dados.

const FIRST_NAMES = [
  "Ana", "Bruno", "Carla", "Diego", "Eduarda", "Felipe", "Gabriela", "Henrique",
  "Isabela", "João", "Karina", "Leonardo", "Mariana", "Nathan", "Otávio",
  "Patrícia", "Rafael", "Sabrina", "Thiago", "Valentina", "William", "Yasmin",
  "Alessandro", "Beatriz", "Caio", "Daniela", "Emerson", "Fernanda", "Gustavo",
  "Helena", "Igor", "Juliana", "Kevin", "Larissa", "Marcelo", "Natália",
  "Paulo", "Priscila", "Rodrigo", "Simone", "Vinícius", "Camila", "Douglas",
  "Elaine", "Fábio", "Giovana", "Hugo", "Ingrid", "Jonas", "Letícia",
];

const LAST_NAMES = [
  "Silva", "Souza", "Oliveira", "Santos", "Pereira", "Costa", "Almeida",
  "Ferreira", "Rodrigues", "Gomes", "Martins", "Araújo", "Melo", "Barbosa",
  "Ribeiro", "Carvalho", "Lima", "Teixeira", "Cardoso", "Correia", "Dias",
  "Nunes", "Moreira", "Cavalcanti", "Batista", "Rocha", "Pinto", "Freitas",
  "Monteiro", "Guimarães", "Brito", "Ramos", "Vieira", "Fonseca", "Castro",
];

const PRODUCTS = [
  { name: "MVW - Maquina de Vendas no Whatsapp | 2ª Edição START", value: 397, weight: 5 },
  { name: "MVW - Maquina de Vendas no Whatsapp | 2ª Edição PREMIUM", value: 1497, weight: 3.5 },
  { name: "MVW - Maquina de Vendas no Whatsapp | 2ª Edição GOLD", value: 997, weight: 1.5 },
];

const SELLERS = [
  { name: "Naty Justino", avatar: "https://i.pravatar.cc/150?img=47" },
  { name: "Lavínia", avatar: "https://i.pravatar.cc/150?img=21" },
  { name: "Karolina", avatar: "https://i.pravatar.cc/150?img=32" },
];

// Ajuste manual pra remanejar algumas vendas fictícias da Naty pras outras
// duas vendedoras, invertendo a ordem do leaderboard (Lavínia 1º, Karolina 2º,
// Naty 3º), sem mudar a quantidade total de vendas geradas.
const SELLER_INDEX_OVERRIDES = { 9: 1, 21: 1, 24: 1, 33: 1, 27: 2, 30: 2 };

const CHANNELS = ["WhatsApp", "Instagram"];

// PRNG determinístico (mulberry32) — com uma seed fixa, os 88 registros
// ficam sempre iguais entre reloads da página, em vez de re-embaralhar
// tudo (nomes/valores diferentes) a cada refresh.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedPick(rng, items) {
  const total = items.reduce((sum, it) => sum + it.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    if (r < it.weight) return it;
    r -= it.weight;
  }
  return items[items.length - 1];
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateFakeTickets(count = 88, seed = 20260715) {
  const rng = mulberry32(seed);
  const now = Date.now();
  const usedNames = new Set();

  return Array.from({ length: count }, (_, i) => {
    // Nome único (evita repetir o mesmo cliente entre os 88 fictícios).
    let clientName;
    do {
      clientName = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)} ${pick(rng, LAST_NAMES)}`;
    } while (usedNames.has(clientName));
    usedNames.add(clientName);

    const product = weightedPick(rng, PRODUCTS);
    // Distribui os 3 vendedores de forma aproximadamente igual (round-robin
    // com um pequeno embaralhamento), em vez de puramente aleatório — assim
    // fica ~30/29/29, igual pedido.
    const seller = SELLERS[SELLER_INDEX_OVERRIDES[i] ?? (i % SELLERS.length)];
    const channel = pick(rng, CHANNELS);

    // Espalha as datas nos últimos 25 dias, sempre no passado.
    const minutesAgo = Math.floor(rng() * 25 * 24 * 60);
    const datetime = new Date(now - minutesAgo * 60 * 1000).toISOString();

    return {
      id: `demo-fake-${i + 1}`,
      kind: "ticket",
      product: product.name,
      value: product.value,
      client: clientName,
      seller: { name: seller.name, avatar: seller.avatar },
      datetime,
      channel,
      origin: "automatico",
    };
  });
}
