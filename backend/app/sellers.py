# app/sellers.py
# Cadastro dos vendedores. A chave é o código que vai na UTM do link de
# checkout da Greenn (ex: ?utm_content=marina) — assim o Make só precisa
# repassar esse código no webhook, sem saber nome/foto de cada vendedor.
#
# Pra crescer além de um punhado de pessoas, migre isso pra uma tabela
# no Postgres. Por enquanto, hardcoded é suficiente e simples de editar.

SELLERS = {
    "marina": {"name": "Marina Souza", "avatar": "https://i.pravatar.cc/150?img=47"},
    "diego": {"name": "Diego Martins", "avatar": "https://i.pravatar.cc/150?img=12"},
    "paula": {"name": "Paula Nunes", "avatar": "https://i.pravatar.cc/150?img=32"},
    "lucas": {"name": "Lucas Ferreira", "avatar": "https://i.pravatar.cc/150?img=68"},
    "camila": {"name": "Camila Rocha", "avatar": "https://i.pravatar.cc/150?img=21"},
}

FALLBACK = {"name": "Vendedor não identificado", "avatar": "https://i.pravatar.cc/150?img=1"}

CHANNEL_ALIASES = {
    "whatsapp": "WhatsApp",
    "wpp": "WhatsApp",
    "instagram": "Instagram",
    "ig": "Instagram",
    "ads": "Ads",
    "facebook_ads": "Ads",
    "google_ads": "Ads",
    "meta_ads": "Ads",
    "organico": "Orgânico",
    "orgânico": "Orgânico",
    "direto": "Orgânico",
}


def resolve_seller(code: str | None):
    if not code:
        return "desconhecido", FALLBACK
    key = code.strip().lower()
    seller = SELLERS.get(key)
    if seller:
        return key, seller
    return key, {"name": f'Vendedor ("{code}" não cadastrado)', "avatar": FALLBACK["avatar"]}


def resolve_channel(utm_source: str | None) -> str:
    if not utm_source:
        return "Orgânico"
    key = utm_source.strip().lower()
    return CHANNEL_ALIASES.get(key, utm_source)
