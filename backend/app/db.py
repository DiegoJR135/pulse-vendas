# app/db.py
from datetime import datetime, timezone

from sqlalchemy import create_engine, String, Float, DateTime, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import DATABASE_URL


class Base(DeclarativeBase):
    pass


class Sale(Base):
    """Uma venda registrada. Essa tabela é a fonte de verdade — Redis é
    só cache do estado derivado (receita do dia, leaderboard etc)."""

    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product: Mapped[str] = mapped_column(String(255))
    value: Mapped[float] = mapped_column(Float)
    client: Mapped[str] = mapped_column(String(255))
    channel: Mapped[str] = mapped_column(String(50))
    origin: Mapped[str] = mapped_column(String(20))  # "automatico" | "manual"
    seller_code: Mapped[str] = mapped_column(String(50))
    seller_name: Mapped[str] = mapped_column(String(255))
    seller_avatar: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": f"sale-{self.id}",
            "product": self.product,
            "value": self.value,
            "client": self.client,
            "channel": self.channel,
            "origin": self.origin,
            "seller": {"name": self.seller_name, "avatar": self.seller_avatar},
            "datetime": self.created_at.isoformat(),
        }


engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db():
    """Cria as tabelas se não existirem. Chamado no startup da API."""
    Base.metadata.create_all(engine)


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
