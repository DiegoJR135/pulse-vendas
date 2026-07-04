# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url: str) -> str:
    """
    Provedores como Railway/Render entregam a URL como 'postgres://...' ou
    'postgresql://...'. O SQLAlchemy com driver psycopg3 precisa do prefixo
    'postgresql+psycopg://'. Isso normaliza automaticamente, então você pode
    colar a DATABASE_URL do Railway direto, sem editar nada.
    """
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


# Postgres — armazena o histórico de vendas (fonte de verdade).
DATABASE_URL = _normalize_database_url(
    os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/pulse_vendas")
)

# Redis — cache do "estado atual" do dashboard, pra servir a TV rápido
# sem precisar recalcular tudo do Postgres a cada request/broadcast.
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Meta de receita do dia, usada pela barra de progresso do front.
DAILY_GOAL_TARGET = float(os.getenv("DAILY_GOAL_TARGET", "250000"))

# Protege o webhook (o Make deve mandar esse valor no header x-api-key).
# Deixe em branco em dev se quiser testar sem header.
WEBHOOK_API_KEY = os.getenv("WEBHOOK_API_KEY", "")

# Domínios que podem consumir a API/SSE (seu front na Vercel + localhost).
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
