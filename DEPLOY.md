# Deploy — Railway (backend) + Vercel (frontend)

Guia passo a passo pra colocar o sistema no ar de verdade. Railway hospeda Postgres, Redis e a API Python juntos (mais simples pra essa stack); Vercel hospeda o Next.js.

---

## Parte 1 — Backend no Railway

### 1.1. Criar o projeto

1. Crie uma conta em [railway.app](https://railway.app) (dá pra logar com GitHub).
2. Suba a pasta `backend/` pra um repositório no GitHub (só essa pasta, ou o monorepo inteiro — o Railway deixa você apontar o "Root Directory").
3. No Railway: **New Project → Deploy from GitHub repo** → selecione o repositório.
4. Se subiu o monorepo inteiro, vá em **Settings → Root Directory** do serviço e coloque `backend`.

O Railway detecta que é um projeto Python (`requirements.txt`) e usa o `railway.json`/`Procfile` que já estão na pasta pra saber como iniciar (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`).

### 1.2. Adicionar Postgres

1. Dentro do mesmo projeto Railway: **+ New → Database → Add PostgreSQL**.
2. Pronto — o Railway cria o banco e já disponibiliza a variável `DATABASE_URL` internamente.

### 1.3. Adicionar Redis

1. **+ New → Database → Add Redis**.
2. O Railway cria e disponibiliza a variável `REDIS_URL`.

### 1.4. Conectar as variáveis no serviço do backend

No serviço do backend (não no banco), vá em **Variables** e adicione (use o botão "Add Reference" pra puxar direto do Postgres/Redis que você criou, em vez de copiar a URL na mão):

| Variável | Valor |
|---|---|
| `DATABASE_URL` | referência ao Postgres do passo 1.2 |
| `REDIS_URL` | referência ao Redis do passo 1.3 |
| `DAILY_GOAL_TARGET` | `250000` (ou o valor da sua meta) |
| `WEBHOOK_API_KEY` | uma chave secreta forte — gere uma com `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | a URL do seu front na Vercel, ex: `https://pulse-vendas.vercel.app` (você volta aqui depois de publicar o front, na Parte 2) |

Clique em **Deploy**. Depois de subir, o Railway te dá uma URL pública tipo `https://seu-backend.up.railway.app`.

### 1.5. Testar o backend no ar

```bash
curl https://seu-backend.up.railway.app/health
# {"ok":true}

curl -X POST https://seu-backend.up.railway.app/api/webhooks/sale \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_WEBHOOK_API_KEY" \
  -d '{"product":"Teste Deploy","value":1000,"client":"Cliente Teste","utm_source":"whatsapp","seller_code":"marina","origin":"manual"}'

curl https://seu-backend.up.railway.app/api/dashboard
# deve trazer a venda de teste como lastSale
```

Se o `POST` der `401`, confira se o header `x-api-key` bate com o `WEBHOOK_API_KEY` configurado.

---

## Parte 2 — Frontend na Vercel

### 2.1. Deploy

1. Crie uma conta em [vercel.com](https://vercel.com) (login com GitHub).
2. **Add New → Project** → selecione o repositório.
3. Em **Root Directory**, aponte pra `frontend`.
4. Em **Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | a URL do backend no Railway, ex: `https://seu-backend.up.railway.app` |
| `NEXT_PUBLIC_USE_SIMULATOR` | `false` |

5. Clique em **Deploy**.

Depois de publicado, a Vercel te dá uma URL tipo `https://pulse-vendas.vercel.app`.

### 2.2. Fechar o CORS

Volte no Railway, no serviço do backend, e atualize a variável `ALLOWED_ORIGINS` pra URL real da Vercel (ex: `https://pulse-vendas.vercel.app`). Sem isso, o navegador bloqueia a conexão SSE por CORS. Redeploy o backend depois de mudar.

### 2.3. Testar de ponta a ponta

1. Abra a URL da Vercel no navegador — deve aparecer "Aguardando a primeira venda..." e o indicador "Ao vivo" verde no header (conexão SSE ativa).
2. Dispare o mesmo `curl` de teste do passo 1.5.
3. A tela deve atualizar sozinha em menos de 1 segundo, sem dar refresh.

---

## Parte 3 — Conectando o Make de verdade

No cenário do Make que já leva a venda da Greenn pro GHL, adicione um módulo **HTTP → Make a request** em paralelo:

- **URL**: `https://seu-backend.up.railway.app/api/webhooks/sale`
- **Method**: `POST`
- **Headers**: `x-api-key` = a mesma `WEBHOOK_API_KEY` do Railway
- **Body type**: JSON
- **Body**:
```json
{
  "product": "{{produto}}",
  "value": {{valor}},
  "client": "{{nome_cliente}}",
  "utm_source": "{{utm_source}}",
  "seller_code": "{{utm_content}}",
  "origin": "automatico"
}
```

Ajuste os `{{...}}` pros nomes reais dos campos que vêm do webhook da Greenn no seu cenário do Make. O `seller_code` precisa bater com uma chave de `backend/app/sellers.py` — edite esse arquivo pra cadastrar todos os vendedores reais antes de ir pra produção.

---

## Parte 4 — Fire TV Stick

1. Compre um Fire TV Stick (qualquer geração recente serve).
2. Na Amazon Appstore da própria Fire TV, instale um navegador — **Silk Browser** já vem instalado; se quiser, dá pra instalar o **Firefox** também.
3. Abra o navegador, digite a URL da Vercel, deixe em tela cheia.
4. Dica: alguns navegadores de Fire TV têm opção de "definir como página inicial" — configure isso pra já abrir direto no dashboard quando a TV ligar.

---

## Resumo de custos

- **Railway**: tem um plano gratuito com créditos limitados por mês; Postgres + Redis + API juntos cabem tranquilo num uso de TV interna. Se passar do free tier, o plano pago é por uso (geralmente poucos dólares/mês pra essa carga).
- **Vercel**: plano gratuito (Hobby) é suficiente — é só front estático/serverless.
- **Fire TV Stick**: custo único de hardware.

## Troubleshooting rápido

| Sintoma | Causa provável |
|---|---|
| Front mostra "Reconectando" sempre | `NEXT_PUBLIC_API_URL` errado, ou `ALLOWED_ORIGINS` no backend não inclui a URL da Vercel |
| `POST /api/webhooks/sale` retorna 401 | `x-api-key` não bate com `WEBHOOK_API_KEY` |
| Venda não aparece na TV mas o `curl` de teste funciona | Confira se o front está mesmo com `NEXT_PUBLIC_USE_SIMULATOR=false` (senão ele ignora o SSE e fica no modo simulador) |
| Vendedor aparece como "não cadastrado" | O `seller_code` mandado pelo Make não bate com nenhuma chave em `backend/app/sellers.py` |
