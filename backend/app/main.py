# app/main.py
import asyncio
import json

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import redis.asyncio as aioredis

from app.config import WEBHOOK_API_KEY, ALLOWED_ORIGINS, REDIS_URL
from app.db import init_db, get_session, Sale
from app.cache import get_cached_snapshot, refresh_and_publish, redis_client, SSE_CHANNEL
from app.sellers import resolve_seller, resolve_channel, SELLERS

app = FastAPI(title="Pulse Vendas API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/dashboard")
def get_dashboard(session: Session = Depends(get_session)):
    """Snapshot atual — o front busca isso uma vez ao carregar a página,
    e depois passa a escutar /api/dashboard/stream (SSE) pras atualizações."""
    return get_cached_snapshot(session)


@app.get("/api/dashboard/stream")
async def stream_dashboard():
    """
    Server-Sent Events: o front abre uma conexão aqui (EventSource) e
    recebe um evento toda vez que uma venda nova é publicada no Redis.
    Substitui o polling — é push de verdade, não fica perguntando a cada X segundos.
    """

    async def event_generator():
        # Usa um cliente redis ASSÍNCRONO aqui (diferente do redis_client síncrono
        # usado no resto do app). O cliente síncrono bloqueia a thread inteira em
        # pubsub.get_message(timeout=...), o que trava o event loop do Uvicorn e
        # impede outras requisições (como o webhook de venda) de serem atendidas
        # enquanto o SSE estiver conectado.
        client = aioredis.from_url(REDIS_URL, decode_responses=True)
        pubsub = client.pubsub()
        await pubsub.subscribe(SSE_CHANNEL)
        try:
            while True:
                message = await pubsub.get_message(timeout=1.0, ignore_subscribe_messages=True)
                if message and message["type"] == "message":
                    yield f"data: {message['data']}\n\n"
                else:
                    yield ": keep-alive\n\n"
        finally:
            await pubsub.unsubscribe(SSE_CHANNEL)
            await pubsub.close()
            await client.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # evita buffering em proxies tipo nginx
        },
    )


@app.post("/api/webhooks/sale")
async def receive_sale(request: Request, session: Session = Depends(get_session)):
    """
    Webhook chamado pelo Make depois que a Greenn confirma uma venda.
    Payload esperado (ajuste os nomes de campo conforme o cenário do Make):

    {
      "product": "Plano Black Anual",
      "value": 18900,
      "client": "Ricardo Almeida",
      "utm_source": "whatsapp",     // canal de venda
      "seller_code": "marina",       // vendedor, extraído da UTM do link
      "origin": "automatico"
    }
    """
    if WEBHOOK_API_KEY:
        provided = request.headers.get("x-api-key")
        if provided != WEBHOOK_API_KEY:
            raise HTTPException(status_code=401, detail="Não autorizado")

    body = await request.json()

    raw_seller_code = body.get("seller_code")
    seller_code, seller = resolve_seller(raw_seller_code)
    # Sem seller_code = venda "sem vendedor identificado". Esses casos caem
    # pra Karolina (ver app/sellers.py) e também são contados como vindos
    # do Instagram, independente do que tiver em utm_source.
    if not raw_seller_code:
        channel = "Instagram"
    else:
        channel = resolve_channel(body.get("utm_source") or body.get("channel"))

    sale = Sale(
        product=body.get("product") or "Produto não informado",
        value=float(body.get("value") or 0),
        client=body.get("client") or "Cliente não informado",
        channel=channel,
        origin="manual" if body.get("origin") == "manual" else "automatico",
        seller_code=seller_code,
        seller_name=seller["name"],
        seller_avatar=seller["avatar"],
    )
    session.add(sale)
    session.commit()
    session.refresh(sale)

    snapshot = refresh_and_publish(session)

    return {"ok": True, "sale": sale.to_dict(), "dashboard": snapshot}


@app.post("/api/admin/backfill-sellers")
def backfill_sellers(request: Request, session: Session = Depends(get_session)):
    """
    Correção pontual pra vendas já gravadas antes de dois ajustes no
    cadastro de vendedores:
    1. "carolranu" foi cadastrada depois de já ter vendas gravadas como
       "não cadastrado" — aqui elas são atualizadas pro nome dela.
    2. O fallback de vendedor ausente mudou de "Vendedor não identificado"
       pra Karolina (+ canal Instagram) — aqui as vendas antigas com esse
       fallback são corrigidas do mesmo jeito.
    Idempotente: pode rodar de novo sem duplicar ou estragar nada.
    """
    if WEBHOOK_API_KEY:
        provided = request.headers.get("x-api-key")
        if provided != WEBHOOK_API_KEY:
            raise HTTPException(status_code=401, detail="Não autorizado")

    carol = SELLERS["carolranu"]
    updated_carol = (
        session.query(Sale)
        .filter(Sale.seller_code == "carolranu")
        .update({"seller_name": carol["name"], "seller_avatar": carol["avatar"]})
    )

    karolina = SELLERS["karolina"]
    updated_unidentified = (
        session.query(Sale)
        .filter(Sale.seller_code == "desconhecido")
        .update(
            {
                "seller_code": "karolina",
                "seller_name": karolina["name"],
                "seller_avatar": karolina["avatar"],
                "channel": "Instagram",
            }
        )
    )

    session.commit()
    snapshot = refresh_and_publish(session)

    return {
        "ok": True,
        "updated_carolranu": updated_carol,
        "updated_unidentified": updated_unidentified,
        "dashboard": snapshot,
    }
# app/main.py
import asyncio
import json

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import redis.asyncio as aioredis

from app.config import WEBHOOK_API_KEY, ALLOWED_ORIGINS, REDIS_URL
from app.db import init_db, get_session, Sale
from app.cache import get_cached_snapshot, refresh_and_publish, redis_client, SSE_CHANNEL
from app.sellers import resolve_seller, resolve_channel

app = FastAPI(title="Pulse Vendas API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/api/dashboard")
def get_dashboard(session: Session = Depends(get_session)):
    """Snapshot atual — o front busca isso uma vez ao carregar a página,
    e depois passa a escutar /api/dashboard/stream (SSE) pras atualizações."""
    return get_cached_snapshot(session)


@app.get("/api/dashboard/stream")
async def stream_dashboard():
    """
    Server-Sent Events: o front abre uma conexão aqui (EventSource) e
    recebe um evento toda vez que uma venda nova é publicada no Redis.
    Substitui o polling — é push de verdade, não fica perguntando a cada X segundos.
    """

    async def event_generator():
        # Usa um cliente redis ASSÍNCRONO aqui (diferente do redis_client síncrono
        # usado no resto do app). O cliente síncrono bloqueia a thread inteira em
        # pubsub.get_message(timeout=...), o que trava o event loop do Uvicorn e
        # impede outras requisições (como o webhook de venda) de serem atendidas
        # enquanto o SSE estiver conectado.
        client = aioredis.from_url(REDIS_URL, decode_responses=True)
        pubsub = client.pubsub()
        await pubsub.subscribe(SSE_CHANNEL)
        try:
            while True:
                message = await pubsub.get_message(timeout=1.0, ignore_subscribe_messages=True)
                if message and message["type"] == "message":
                    yield f"data: {message['data']}\n\n"
                else:
                    yield ": keep-alive\n\n"
        finally:
            await pubsub.unsubscribe(SSE_CHANNEL)
            await pubsub.close()
            await client.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # evita buffering em proxies tipo nginx
        },
    )


@app.post("/api/webhooks/sale")
async def receive_sale(request: Request, session: Session = Depends(get_session)):
    """
    Webhook chamado pelo Make depois que a Greenn confirma uma venda.
    Payload esperado (ajuste os nomes de campo conforme o cenário do Make):

    {
      "product": "Plano Black Anual",
      "value": 18900,
      "client": "Ricardo Almeida",
      "utm_source": "whatsapp",     // canal de venda
      "seller_code": "marina",       // vendedor, extraído da UTM do link
      "origin": "automatico"
    }
    """
    if WEBHOOK_API_KEY:
        provided = request.headers.get("x-api-key")
        if provided != WEBHOOK_API_KEY:
            raise HTTPException(status_code=401, detail="Não autorizado")

    body = await request.json()

    seller_code, seller = resolve_seller(body.get("seller_code"))
    channel = resolve_channel(body.get("utm_source") or body.get("channel"))

    sale = Sale(
        product=body.get("product") or "Produto não informado",
        value=float(body.get("value") or 0),
        client=body.get("client") or "Cliente não informado",
        channel=channel,
        origin="manual" if body.get("origin") == "manual" else "automatico",
        seller_code=seller_code,
        seller_name=seller["name"],
        seller_avatar=seller["avatar"],
    )
    session.add(sale)
    session.commit()
    session.refresh(sale)

    snapshot = refresh_and_publish(session)

    return {"ok": True, "sale": sale.to_dict(), "dashboard": snapshot}
