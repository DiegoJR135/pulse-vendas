# Grupo Nexus — Servidor de Vendas ao Vivo

Sistema de acompanhamento de vendas em tempo real, feito pra rodar em uma TV de escritório (via Fire TV Stick).

## Arquitetura

```
Greenn (checkout) → webhook → Make → backend/ (Python/FastAPI) → Postgres + Redis
                                            │
                                            │ SSE (Server-Sent Events)
                                            ▼
                                  frontend/ (Next.js) → TV
```

- **`backend/`** — API Python (FastAPI). Recebe o webhook do Make, grava a venda no Postgres, recalcula o estado (receita, canais, leaderboard), guarda em cache no Redis e publica a atualização — todo mundo que estiver com a TV aberta recebe na hora via SSE.
- **`frontend/`** — Next.js. Só interface: abre uma conexão SSE com o backend e atualiza a tela conforme os eventos chegam. Hospedado na Vercel (não precisa de servidor dedicado).
- **Fire TV Stick** — a TV não tem navegador nativo; o Fire Stick roda o navegador que acessa a URL do Next.js publicada na Vercel.

## Rodando localmente

### 1. Frontend (com simulador — não precisa do backend)

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000` (redireciona pra `/tv-dashboard`). Por padrão (`NEXT_PUBLIC_USE_SIMULATOR=true` no `.env.local`), o front gera vendas fake a cada 10s sozinho — dá pra ver o layout completo sem precisar subir Postgres/Redis/backend.

### 2. Backend real (Postgres + Redis + API)

```bash
cd backend
docker compose up -d          # sobe Postgres e Redis
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Depois, no `frontend/.env.local`, troque `NEXT_PUBLIC_USE_SIMULATOR` pra `false` e rode `npm run dev` de novo — o front vai conectar via SSE no backend real.

Teste disparando uma venda manualmente:

```bash
curl -X POST http://localhost:8000/api/webhooks/sale \
  -H "Content-Type: application/json" \
  -d '{"product":"Plano Black Anual","value":18900,"client":"Ricardo Almeida","utm_source":"whatsapp","seller_code":"marina","origin":"automatico"}'
```

A TV atualiza instantaneamente (SSE — não é polling).

## Ligando ao fluxo real (Greenn → Make → Backend)

No cenário do Make que já leva a venda da Greenn pro GHL, adicione um módulo HTTP extra em paralelo, apontando pra:

```
POST https://sua-api.exemplo.com/api/webhooks/sale
Header: x-api-key: <WEBHOOK_API_KEY do .env>
Body:
{
  "product": "{{produto}}",
  "value": {{valor}},
  "client": "{{nome_cliente}}",
  "utm_source": "{{utm_source}}",
  "seller_code": "{{utm_content}}",
  "origin": "automatico"
}
```

O `seller_code` deve bater com uma das chaves cadastradas em `backend/app/sellers.py` (é o código que fica na UTM do link de checkout de cada vendedor).

## Deploy

Guia passo a passo completo (Railway pro backend + Vercel pro front) em [`DEPLOY.md`](./DEPLOY.md).

Resumo:
- **Frontend** → Vercel. Configure `NEXT_PUBLIC_API_URL` (URL pública do backend) e `NEXT_PUBLIC_USE_SIMULATOR=false` nas env vars do projeto.
- **Backend** → Railway (Postgres + Redis + API Python no mesmo projeto — mais simples pra essa stack). Configure `DATABASE_URL`, `REDIS_URL`, `WEBHOOK_API_KEY` e `ALLOWED_ORIGINS` (domínio da Vercel).

## Pra exibir na TV

1. Compre um Fire TV Stick e instale um navegador (ex: Silk Browser, já vem, ou Firefox pela loja).
2. Abra a URL do frontend publicado na Vercel.
3. Deixe em tela cheia. Se o navegador permitir, configure pra abrir automaticamente nessa URL ao ligar a TV.
