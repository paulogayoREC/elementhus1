#!/usr/bin/env python3
"""Publica novos produtos das paginas de indicacoes no Telegram.

O script varre `indicacoes/*.html`, identifica cards `.affiliate-product-card`,
compara com um arquivo de estado e envia apenas produtos ainda nao publicados.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import mimetypes
import os
import sys
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin, urlsplit
from urllib.request import Request, urlopen


DEFAULT_SITE_URL = "https://encontreaquitech.com"
DEFAULT_STATE_FILE = ".github/telegram-products-state.json"
PRODUCT_CARD_CLASS = "affiliate-product-card"
PRODUCT_LINK_CLASS = "product-buy-link"
VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}
PRICE_CLASSES = {
    "affiliate-product-price",
    "offer-price",
    "price",
    "product-price",
    "telegram-price",
}
SUBTITLE_CLASSES = {
    "affiliate-product-description",
    "product-description",
    "product-subtitle",
    "product-summary",
    "telegram-subtitle",
}


@dataclass(slots=True)
class Product:
    id: str
    title: str
    subtitle: str
    price: str
    href: str
    image_src: str
    image_url: str
    image_file: str
    category: str
    source_file: str
    source_index: int


class ProductPageParser(HTMLParser):
    def __init__(self, category_fallback: str) -> None:
        super().__init__(convert_charrefs=True)
        self.category_fallback = category_fallback
        self.page_title = ""
        self.products: list[dict[str, str]] = []

        self._current: dict[str, str] | None = None
        self._article_depth = 0
        self._capture_target = ""
        self._capture_depth = 0
        self._capture_parts: list[str] = []
        self._capture_h1 = False
        self._h1_depth = 0
        self._h1_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = normalize_attrs(attrs)
        classes = class_set(attrs_map.get("class", ""))

        if self._capture_h1:
            self._h1_depth += 1

        if self._current is None and tag == "h1" and not self.page_title:
            self._capture_h1 = True
            self._h1_depth = 1
            self._h1_parts = []
            return

        if tag == "article" and PRODUCT_CARD_CLASS in classes:
            self._current = {
                "title": first_value(
                    attrs_map,
                    "data-telegram-title",
                    "data-product-title",
                    "data-title",
                ),
                "subtitle": first_value(
                    attrs_map,
                    "data-telegram-subtitle",
                    "data-product-subtitle",
                    "data-product-description",
                    "data-description",
                ),
                "price": first_value(
                    attrs_map,
                    "data-telegram-price",
                    "data-product-price",
                    "data-price",
                ),
                "href": "",
                "image_src": "",
                "image_alt": "",
            }
            self._article_depth = 1
            return

        if self._current is None:
            return

        if tag not in VOID_TAGS:
            self._article_depth += 1
        if self._capture_target and tag not in VOID_TAGS:
            self._capture_depth += 1

        if tag == "img" and not self._current.get("image_src"):
            self._current["image_src"] = attrs_map.get("src", "")
            self._current["image_alt"] = attrs_map.get("alt", "")
            return

        if tag == "a" and PRODUCT_LINK_CLASS in classes:
            self._current["href"] = attrs_map.get("href", "")
            return

        if not self._capture_target and tag in {"h3", "h4"}:
            self._start_capture("title")
            return

        if not self._capture_target and classes.intersection(PRICE_CLASSES):
            self._start_capture("price")
            return

        if not self._capture_target and classes.intersection(SUBTITLE_CLASSES):
            self._start_capture("subtitle")

    def handle_data(self, data: str) -> None:
        if self._capture_h1:
            self._h1_parts.append(data)

        if self._current is not None and self._capture_target:
            self._capture_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self._capture_h1:
            self._h1_depth -= 1
            if self._h1_depth <= 0:
                self.page_title = clean_text(" ".join(self._h1_parts)).rstrip(".")
                self._capture_h1 = False
                self._h1_parts = []

        if self._current is None:
            return

        if self._capture_target:
            self._capture_depth -= 1
            if self._capture_depth <= 0:
                value = clean_text(" ".join(self._capture_parts))
                if value and not self._current.get(self._capture_target):
                    self._current[self._capture_target] = value
                self._capture_target = ""
                self._capture_parts = []

        self._article_depth -= 1
        if self._article_depth <= 0:
            self._finish_product()

    def _start_capture(self, target: str) -> None:
        self._capture_target = target
        self._capture_depth = 1
        self._capture_parts = []

    def _finish_product(self) -> None:
        if not self._current:
            return

        title = clean_text(self._current.get("title") or self._current.get("image_alt"))
        href = clean_text(self._current.get("href"))
        image_src = clean_text(self._current.get("image_src"))

        if title and href and image_src:
            self.products.append(
                {
                    "title": title,
                    "subtitle": clean_text(self._current.get("subtitle")),
                    "price": clean_text(self._current.get("price")),
                    "href": href,
                    "image_src": image_src,
                }
            )

        self._current = None
        self._article_depth = 0
        self._capture_target = ""
        self._capture_parts = []


def normalize_attrs(attrs: Iterable[tuple[str, str | None]]) -> dict[str, str]:
    return {name.lower(): value or "" for name, value in attrs}


def class_set(value: str) -> set[str]:
    return {item.strip() for item in value.split() if item.strip()}


def first_value(attrs: dict[str, str], *names: str) -> str:
    for name in names:
        value = clean_text(attrs.get(name, ""))
        if value:
            return value
    return ""


def clean_text(value: str | None) -> str:
    return html.unescape(str(value or "")).replace("\xa0", " ").strip()


def compact_text(value: str | None) -> str:
    return " ".join(clean_text(value).split())


def slug_to_title(slug: str) -> str:
    special_cases = {
        "casa-inteligente": "Casa Inteligente",
        "cooler-refrigeracao": "Cooler e Refrigeração",
        "memorias-armazenamento": "Memórias e Armazenamento",
        "pc-gamming": "PC Gamming",
        "pecas-componentes": "Peças e Componentes",
        "placa-de-video": "Placa de Vídeo",
        "placa-mae": "Placa Mãe",
    }
    if slug in special_cases:
        return special_cases[slug]
    return slug.replace("-", " ").title()


def product_identity(href: str, title: str, source_file: str) -> str:
    raw_identity = href.strip() or f"{source_file}:{title}"
    return hashlib.sha256(raw_identity.encode("utf-8")).hexdigest()[:20]


def public_url(raw_path: str, page_path: Path, root: Path, site_url: str) -> str:
    if raw_path.startswith(("http://", "https://")):
        return raw_path

    relative_dir = page_path.parent.relative_to(root).as_posix()
    base_url = f"{site_url.rstrip('/')}/{relative_dir}/"
    return urljoin(base_url, raw_path)


def local_image_path(raw_path: str, page_path: Path, root: Path) -> str:
    if raw_path.startswith(("http://", "https://", "data:")):
        return ""

    clean_path = urlsplit(raw_path).path

    if clean_path.startswith("/"):
        candidate = root / clean_path.lstrip("/")
    else:
        candidate = page_path.parent / clean_path

    try:
        resolved = candidate.resolve()
        resolved.relative_to(root.resolve())
    except ValueError:
        return ""

    return str(resolved) if resolved.is_file() else ""


def parse_product_page(page_path: Path, root: Path, site_url: str) -> list[Product]:
    fallback_category = slug_to_title(page_path.stem)
    parser = ProductPageParser(fallback_category)
    parser.feed(page_path.read_text(encoding="utf-8"))
    category = parser.page_title or fallback_category
    source_file = page_path.relative_to(root).as_posix()
    products: list[Product] = []

    for index, item in enumerate(parser.products):
        title = compact_text(item["title"])
        href = compact_text(item["href"])
        image_src = compact_text(item["image_src"])
        subtitle = compact_text(item["subtitle"])
        price = compact_text(item["price"])

        products.append(
            Product(
                id=product_identity(href, title, source_file),
                title=title,
                subtitle=subtitle,
                price=price,
                href=href,
                image_src=image_src,
                image_url=public_url(image_src, page_path, root, site_url),
                image_file=local_image_path(image_src, page_path, root),
                category=category,
                source_file=source_file,
                source_index=index,
            )
        )

    return products


def discover_products(root: Path, site_url: str) -> list[Product]:
    pages = sorted((root / "indicacoes").glob("*.html"))
    products_by_id: dict[str, Product] = {}

    for page_path in pages:
        for product in parse_product_page(page_path, root, site_url):
            products_by_id.setdefault(product.id, product)

    return sorted(
        products_by_id.values(),
        key=lambda item: (item.source_file, item.source_index, item.title),
    )


def load_env_file(path: Path) -> None:
    if not path.is_file():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def load_state(path: Path) -> dict:
    if not path.is_file():
        return {"version": 1, "posted": {}}

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Arquivo de estado invalido: {path} ({exc})") from exc

    posted = data.get("posted", {})
    if isinstance(posted, list):
        posted = {str(item): {"id": str(item)} for item in posted}
    if not isinstance(posted, dict):
        posted = {}

    return {"version": 1, "posted": posted}


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f"{path.name}.tmp")
    temp_path.write_text(
        json.dumps(state, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    temp_path.replace(path)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def state_entry(product: Product, status: str) -> dict[str, str]:
    return {
        "category": product.category,
        "href": product.href,
        "image": product.image_url,
        "source": product.source_file,
        "status": status,
        "title": product.title,
        "updated_at": now_iso(),
    }


def truncate_text(value: str, limit: int) -> str:
    value = compact_text(value)
    if len(value) <= limit:
        return value
    return value[: max(0, limit - 3)].rstrip() + "..."


def build_message(product: Product, *, photo_caption: bool) -> str:
    title = truncate_text(product.title, 170)
    subtitle = truncate_text(
        product.subtitle or f"Indicação selecionada na categoria {product.category}.",
        210,
    )
    price = product.price or "Confira o preço atualizado na Amazon"
    title_line = f"<b>{html.escape(title)}</b>"
    lines = [
        "🔥 <b>Oferta Tech</b>",
        "",
        title_line,
        html.escape(subtitle),
        "",
        f"💰 {html.escape(price)}",
        "",
        "👉 <b>Ver na Amazon:</b>",
        html.escape(product.href),
    ]
    message = "\n".join(lines)

    if photo_caption and len(message) > 1024:
        short_subtitle = truncate_text(product.subtitle or product.category, 90)
        lines[3] = html.escape(short_subtitle)
        message = "\n".join(lines)

    return message


def encode_multipart(
    fields: dict[str, str],
    files: dict[str, tuple[str, str, bytes]],
) -> tuple[bytes, str]:
    boundary = f"----eat-telegram-{uuid.uuid4().hex}"
    body = bytearray()

    for name, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8")
        )
        body.extend(str(value).encode("utf-8"))
        body.extend(b"\r\n")

    for field_name, (filename, content_type, content) in files.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(
            (
                f'Content-Disposition: form-data; name="{field_name}"; '
                f'filename="{filename}"\r\n'
            ).encode("utf-8")
        )
        body.extend(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
        body.extend(content)
        body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))
    return bytes(body), f"multipart/form-data; boundary={boundary}"


def telegram_request(
    token: str,
    method: str,
    fields: dict[str, str],
    files: dict[str, tuple[str, str, bytes]] | None = None,
) -> dict:
    url = f"https://api.telegram.org/bot{token}/{method}"

    if files:
        data, content_type = encode_multipart(fields, files)
    else:
        data = urlencode(fields).encode("utf-8")
        content_type = "application/x-www-form-urlencoded"

    request = Request(
        url,
        data=data,
        headers={
            "Content-Type": content_type,
            "User-Agent": "EncontreAquiTechTelegramPoster/1.0",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=35) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Telegram HTTP {exc.code}: {body}") from exc
    except URLError as exc:
        raise RuntimeError(f"Falha de rede ao acessar Telegram: {exc.reason}") from exc

    if not payload.get("ok"):
        raise RuntimeError(f"Telegram recusou a requisicao: {payload}")

    return payload


def send_product(product: Product, token: str, chat_id: str) -> None:
    caption = build_message(product, photo_caption=True)
    photo_file = Path(product.image_file) if product.image_file else None

    if photo_file and photo_file.is_file():
        content_type = mimetypes.guess_type(photo_file.name)[0] or "application/octet-stream"
        telegram_request(
            token,
            "sendPhoto",
            {
                "chat_id": chat_id,
                "caption": caption,
                "parse_mode": "HTML",
            },
            {
                "photo": (
                    photo_file.name,
                    content_type,
                    photo_file.read_bytes(),
                )
            },
        )
        return

    if product.image_url:
        telegram_request(
            token,
            "sendPhoto",
            {
                "chat_id": chat_id,
                "caption": caption,
                "parse_mode": "HTML",
                "photo": product.image_url,
            },
        )
        return

    telegram_request(
        token,
        "sendMessage",
        {
            "chat_id": chat_id,
            "disable_web_page_preview": "false",
            "parse_mode": "HTML",
            "text": build_message(product, photo_caption=False),
        },
    )


def print_dry_run(products: list[Product]) -> None:
    if not products:
        print("Nenhum produto novo para publicar.")
        return

    for product in products:
        print("-" * 72)
        print(f"Produto: {product.title}")
        print(f"Categoria: {product.category}")
        print(f"Fonte: {product.source_file}")
        print(f"Imagem: {product.image_file or product.image_url}")
        print()
        print(build_message(product, photo_caption=True))


def resolve_path(root: Path, path_value: str) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else root / path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Publica no Telegram produtos novos encontrados em indicacoes/*.html."
    )
    parser.add_argument(
        "--root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Raiz do projeto. Padrao: repositorio atual.",
    )
    parser.add_argument(
        "--state",
        default=os.environ.get("EAT_TELEGRAM_STATE_FILE", DEFAULT_STATE_FILE),
        help=f"Arquivo de estado. Padrao: {DEFAULT_STATE_FILE}.",
    )
    parser.add_argument(
        "--site-url",
        default=os.environ.get("EAT_SITE_URL", DEFAULT_SITE_URL),
        help=f"URL publica do site. Padrao: {DEFAULT_SITE_URL}.",
    )
    parser.add_argument(
        "--env-file",
        default="",
        help="Arquivo opcional com variaveis TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Mostra o que seria publicado, sem chamar a API do Telegram.",
    )
    parser.add_argument(
        "--mark-existing",
        action="store_true",
        help="Marca todos os produtos atuais como ja publicados, sem enviar mensagens.",
    )
    parser.add_argument(
        "--allow-first-run-post",
        action="store_true",
        help="Permite publicar todos os produtos caso o arquivo de estado ainda nao exista.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Limite opcional de produtos enviados nesta execucao.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    root = Path(args.root).resolve()
    state_path = resolve_path(root, args.state)
    site_url = args.site_url.rstrip("/")

    env_file = Path(args.env_file) if args.env_file else root / "private" / "telegram.env"
    load_env_file(env_file)

    token = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("EAT_TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID") or os.environ.get("EAT_TELEGRAM_CHAT_ID")

    products = discover_products(root, site_url)
    state_exists = state_path.is_file()
    state = load_state(state_path)
    posted = state.setdefault("posted", {})

    if args.mark_existing:
        marked_at = now_iso()
        for product in products:
            entry = state_entry(product, "marked_existing")
            entry["marked_at"] = marked_at
            posted[product.id] = entry
        save_state(state_path, state)
        print(f"{len(products)} produtos marcados como existentes em {state_path}.")
        return 0

    new_products = [product for product in products if product.id not in posted]
    if args.limit > 0:
        new_products = new_products[: args.limit]

    if args.dry_run:
        print_dry_run(new_products)
        return 0

    if not state_exists and new_products and not args.allow_first_run_post:
        print(
            "Arquivo de estado ainda nao existe. Para evitar spam com produtos antigos, "
            f"rode primeiro: python scripts/postar-produtos-telegram.py --mark-existing --state {args.state}",
            file=sys.stderr,
        )
        return 2

    if not new_products:
        print("Nenhum produto novo para publicar.")
        return 0

    if not token or not chat_id:
        print(
            "Configure TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID antes de publicar.",
            file=sys.stderr,
        )
        return 2

    sent = 0
    for product in new_products:
        send_product(product, token, chat_id)
        entry = state_entry(product, "posted")
        entry["posted_at"] = now_iso()
        posted[product.id] = entry
        sent += 1
        save_state(state_path, state)
        print(f"Publicado no Telegram: {product.title}")

    print(f"{sent} produto(s) publicado(s) no Telegram.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
