# app/cache.py
import json
from datetime import datetime, timezone

import redis

from app.config import REDIS_URL, DAILY_GOAL_TARGET
from app.db import Sale

DASHBOARD_CACHE_KEY = "dashboard:snapshot"
SSE_CHANNEL = "dashboard:updates"

redis_client = redis.from_url(REDIS_URL, decode_responses=True)


def build_dashboard_snapshot(session) -> dict:
    """Lê o Postgres, monta o estado atual do dashboard e recalcula tudo
    (receita, canais, leaderboard). Chamado quando uma venda nova chega."""
    sales = session.query(Sale).order_by(Sale.created_at.desc()).all()
    sales_dicts = [s.to_dict() for s in sales]

    current_revenue = sum(s.value for s in sales)

    channel_totals: dict[str, float] = {}
    for s in sales:
        channel_totals[s.channel] = channel_totals.get(s.channel, 0) + s.value
    channel_sum = sum(channel_totals.values()) or 1
    channels = sorted(
        [
            {"id": name.lower().replace("ê", "e").replace("ó", "o"), "name": name, "value": value, "percent": round(value / channel_sum * 100)}
            for name, value in channel_totals.items()
        ],
        key=lambda c: c["value"],
        reverse=True,
    )

    seller_totals: dict[str, dict] = {}
    for s in sales:
        key = s.seller_name
        if key not in seller_totals:
            seller_totals[key] = {"name": s.seller_name, "avatar": s.seller_avatar, "total": 0, "deals": 0}
        seller_totals[key]["total"] += s.value
        seller_totals[key]["deals"] += 1
    leaderboard = sorted(seller_totals.values(), key=lambda s: s["total"], reverse=True)[:5]
    for i, seller in enumerate(leaderboard):
        seller["rank"] = i + 1

    return {
        "dailyGoal": {"current": current_revenue, "target": DAILY_GOAL_TARGET},
        "channels": channels,
        "lastSale": sales_dicts[0] if sales_dicts else None,
        "salesFeed": sales_dicts[1:8],
        "leaderboard": leaderboard,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }


def refresh_and_publish(session):
    """Recalcula o snapshot, salva no Redis (cache) e publica no canal
    pub/sub — é isso que acorda todas as conexões SSE abertas."""
    snapshot = build_dashboard_snapshot(session)
    payload = json.dumps(snapshot)
    redis_client.set(DASHBOARD_CACHE_KEY, payload)
    redis_client.publish(SSE_CHANNEL, payload)
    return snapshot


def get_cached_snapshot(session) -> dict:
    """Serve rápido do Redis; se não tiver cache ainda (primeira execução),
    calcula do zero a partir do Postgres."""
    cached = redis_client.get(DASHBOARD_CACHE_KEY)
    if cached:
        return json.loads(cached)
    return refresh_and_publish(session)
