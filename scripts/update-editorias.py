#!/usr/bin/env python3
"""Atualiza a curadoria das editorias a partir de feeds publicos."""

from __future__ import annotations

import email.utils
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "js" / "editorial-data.js"
MAX_AGE_DAYS = 7
ITEMS_PER_CATEGORY = 2


@dataclass(frozen=True)
class Source:
    name: str
    feed: str
    bias: str | None = None


SOURCES = [
    Source("Olhar Digital", "https://olhardigital.com.br/feed/"),
    Source("TecMundo", "https://www.tecmundo.com.br/feed"),
    Source("Canaltech", "https://canaltech.com.br/rss/"),
    Source("InfoMoney", "https://www.infomoney.com.br/feed/"),
    Source("Convergencia Digital", "https://convergenciadigital.com.br/feed/"),
    Source("TechCrunch", "https://techcrunch.com/feed/"),
    Source("Wired", "https://www.wired.com/feed/rss"),
    Source("The Verge", "https://www.theverge.com/rss/index.xml"),
    Source("Ars Technica", "https://feeds.arstechnica.com/arstechnica/index"),
    Source("Gizmodo", "https://gizmodo.com/rss"),
    Source("Engadget", "https://www.engadget.com/rss.xml"),
    Source("Mashable Tech", "https://mashable.com/feeds/rss/tech"),
    Source("ZDNET", "https://www.zdnet.com/news/rss.xml"),
    Source("Tom's Hardware", "https://www.tomshardware.com/feeds/all"),
    Source("InfoWester", "https://www.infowester.com/feed/"),
    Source("CNET", "https://www.cnet.com/rss/news/"),
    Source("Digital Trends", "https://www.digitaltrends.com/feed/"),
    Source("GeekWire", "https://www.geekwire.com/feed/"),
    Source("The Next Web", "https://thenextweb.com/feed/"),
    Source("The Hacker News", "https://feeds.feedburner.com/TheHackersNews", "alertas"),
    Source("InfoWorld", "https://www.infoworld.com/index.rss"),
    Source("Computerworld", "https://www.computerworld.com/index.rss"),
    Source("PCWorld", "https://www.pcworld.com/feed", "tutoriais"),
    Source("MacRumors", "https://www.macrumors.com/macrumors.xml"),
    Source("Android Authority", "https://www.androidauthority.com/feed", "tutoriais"),
    Source("Android Central", "https://www.androidcentral.com/feed", "tutoriais"),
    Source("Notebookcheck", "https://www.notebookcheck.net/?type=100"),
    Source("XDA Developers", "https://www.xda-developers.com/feed/", "tutoriais"),
    Source("MIT Technology Review", "https://www.technologyreview.com/feed/"),
    Source("Analytics Insight", "https://www.analyticsinsight.net/feed"),
]


CATEGORY_KEYWORDS = {
    "noticias": [
        "ai",
        "app store",
        "apple",
        "chatgpt",
        "chip",
        "cpu",
        "cyber",
        "data center",
        "google",
        "ia",
        "microsoft",
        "openai",
        "seguranca",
        "semiconductor",
        "smartphone",
        "startup",
        "tecnologia",
    ],
    "novidades": [
        "android",
        "app",
        "chip",
        "device",
        "ferramenta",
        "gemini",
        "gadget",
        "hardware",
        "lanca",
        "lancamento",
        "new",
        "novo",
        "release",
        "windows",
    ],
    "curiosidades": [
        "cultura",
        "curious",
        "curioso",
        "descoberta",
        "historia",
        "meme",
        "robot",
        "robots",
        "weird",
        "3d",
    ],
    "alertas": [
        "breach",
        "cve",
        "cyber",
        "ddos",
        "exploit",
        "fraud",
        "golpe",
        "hack",
        "malware",
        "phishing",
        "ransomware",
        "security",
        "seguranca",
        "vazamento",
        "vulnerability",
        "zero-day",
    ],
    "tutoriais": [
        "como",
        "dica",
        "guide",
        "how to",
        "passo",
        "setup",
        "tutorial",
        "use",
    ],
}


CATEGORY_MIN_SCORE = {
    "noticias": 2,
    "novidades": 2,
    "curiosidades": 1,
    "alertas": 2,
    "tutoriais": 2,
}


EXCLUDED_TITLE_KEYWORDS = [
    "anime",
    "atriz",
    "ator",
    "cinema",
    "filme",
    "filmes",
    "maratona",
    "novela",
    "serie",
    "series",
    "temporada",
]


CATEGORY_LABELS = {
    "noticias": "Noticias",
    "novidades": "Novidades tecnologicas",
    "curiosidades": "Curiosidades",
    "alertas": "Alertas de Seguranca",
    "tutoriais": "Tutoriais",
}


CATEGORY_TAGS = {
    "noticias": "Radar tech",
    "novidades": "Novidade",
    "curiosidades": "Cultura digital",
    "alertas": "Alerta",
    "tutoriais": "Guia pratico",
}


CATEGORY_IMAGES = {
    "noticias": "assets/img/astronaut-earth.png",
    "novidades": "assets/img/astronauta-eat-cutout.png",
    "curiosidades": "assets/img/post-instagram-eat.png",
    "alertas": "assets/img/astro001-cutout.png",
    "tutoriais": "assets/img/amazon-delivery-hero.png",
}


SEED_ITEMS = {
    "noticias": [
        {
            "title": "App Store volta a crescer e IA pode estar acelerando novos apps",
            "source": "TechCrunch",
            "url": "https://techcrunch.com/2026/04/18/the-app-store-is-booming-again-and-ai-may-be-why/",
            "date": "2026-04-18",
            "tag": "IA e apps",
            "image": "assets/img/astronaut-earth.png",
            "summary": "Levantamento da Appfigures indica salto nos lancamentos de apps em 2026, com ferramentas de IA ajudando criadores a transformar ideias em produtos moveis.",
        },
        {
            "title": "OpenAI e KondZilla anunciam curso gratuito de IA para periferias",
            "source": "Canaltech",
            "url": "https://canaltech.com.br/mercado/openai-e-kondzilla-lancam-curso-gratuito-de-ia-com-foco-em-periferias/",
            "date": "2026-04-16",
            "tag": "Educacao em IA",
            "image": "assets/img/astro001-cutout.png",
            "summary": "O Mutirao.AI combina aulas online e encontros presenciais para aproximar ferramentas de inteligencia artificial de criadores e trabalhadores de comunidades perifericas.",
        },
    ],
    "novidades": [
        {
            "title": "Arquitetos da Apple, Qualcomm e Nuvia criam startup de CPUs para IA",
            "source": "Tom's Hardware",
            "url": "https://www.tomshardware.com/pc-components/cpus/legendary-qualcomm-apple-and-nuvia-alumni-form-new-cpu-startup-nuvacore-promises-to-rewrite-the-rules-of-silicon",
            "date": "2026-04-16",
            "tag": "Chips para IA",
            "image": "assets/img/astronauta-eat-cutout.png",
            "summary": "A Nuvacore nasce com foco em processadores para infraestrutura de IA e computacao agentica, mirando eficiencia e desempenho em data centers.",
        },
        {
            "title": "Meta aumenta preco dos Quest por escassez de RAM ligada a IA",
            "source": "Tom's Hardware",
            "url": "https://www.tomshardware.com/virtual-reality/meta-raising-quest-headset-prices-due-to-ai-driven-ram-shortage-quest-3-to-cost-usd600-quest-3s-usd350-from-april-19",
            "date": "2026-04-16",
            "tag": "VR e mercado",
            "image": "assets/img/amazon-delivery-hero.png",
            "summary": "A demanda de memoria para data centers de IA pressiona componentes de consumo e ja afeta precos de produtos como os headsets Meta Quest.",
        },
    ],
    "curiosidades": [
        {
            "title": "Impressoras 3D da Bambu ganham mistura de cores com filamentos",
            "source": "Tom's Hardware",
            "url": "https://www.tomshardware.com/3d-printing/bambu-updates-its-3d-printers-to-print-unique-hues-or-gradients-using-two-or-three-filaments-company-acknowledges-orcaslicer-fullspectrum-fork-as-the-basis-for-the-color-prediction-part-of-the-new-feature",
            "date": "2026-04-16",
            "tag": "3D criativo",
            "image": "assets/img/post-instagram-eat.png",
            "summary": "Atualizacao do Bambu Studio permite criar tons e gradientes combinando dois ou tres filamentos, usando um truque visual parecido com mistura de pontos de impressao.",
        },
        {
            "title": "Caso Spotify e Anna's Archive levanta novo debate sobre scraping e IA",
            "source": "Tom's Hardware",
            "url": "https://www.tomshardware.com/tech-industry/annas-archive-fined-322-million",
            "date": "2026-04-16",
            "tag": "Dados e IA",
            "image": "assets/img/astronaut-earth.png",
            "summary": "A decisao envolvendo 86 milhoes de arquivos raspados do Spotify pode influenciar futuras disputas sobre coleta de dados, autenticacao e treinamento de modelos.",
        },
    ],
    "alertas": [
        {
            "title": "Tres zero-days do Microsoft Defender sao explorados ativamente",
            "source": "The Hacker News",
            "url": "https://thehackernews.com/2026/04/three-microsoft-defender-zero-days.html",
            "date": "2026-04-17",
            "tag": "Zero-day",
            "image": "assets/img/post-instagram-eat.png",
            "summary": "Falhas conhecidas como BlueHammer, RedSun e UnDefend foram observadas em exploracao real; duas ainda estavam sem correcao no momento da publicacao.",
        },
        {
            "title": "Patch Tuesday de abril corrige falhas criticas em SAP, Adobe, Microsoft e Fortinet",
            "source": "The Hacker News",
            "url": "https://thehackernews.com/2026/04/april-patch-tuesday-fixes-critical.html",
            "date": "2026-04-15",
            "tag": "Atualizacoes",
            "image": "assets/img/astro001-cutout.png",
            "summary": "A rodada de correcoes inclui vulnerabilidades criticas, exploracao ativa e risco especial para ambientes corporativos que dependem de SharePoint, Acrobat e FortiSandbox.",
        },
    ],
    "tutoriais": [
        {
            "title": "Como criar uma saudacao personalizada no Take a Message do Pixel",
            "source": "Android Authority",
            "url": "https://www.androidauthority.com/google-pixel-take-a-message-custom-greeting-how-to-3656399/",
            "date": "2026-04-12",
            "tag": "Android",
            "image": "assets/img/astronauta-eat-cutout.png",
            "summary": "O guia mostra requisitos e caminho no app Telefone do Google para gravar saudacoes personalizadas no recurso de mensagens de chamadas perdidas.",
        },
        {
            "title": "Como testar o novo app do Gemini no Windows",
            "source": "Engadget",
            "url": "https://www.engadget.com/apps/googles-new-windows-app-is-yet-another-way-to-access-gemini-214000564.html",
            "date": "2026-04-14",
            "tag": "Windows e IA",
            "image": "assets/img/amazon-delivery-hero.png",
            "summary": "O app do Google para Windows usa atalho Alt + Espaco, busca local, Google Drive e Lens para trazer o Gemini ao fluxo de trabalho no desktop.",
        },
    ],
}


TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")


def normalize(text: str) -> str:
    text = html.unescape(text or "")
    text = TAG_RE.sub(" ", text)
    return SPACE_RE.sub(" ", text).strip()


def parse_date(value: str) -> datetime | None:
    if not value:
        return None

    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except (TypeError, ValueError):
        pass

    value = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def tag_name(element: ET.Element) -> str:
    return element.tag.rsplit("}", 1)[-1].lower()


def child_text(element: ET.Element, names: Iterable[str]) -> str:
    wanted = set(names)
    for child in element:
        if tag_name(child) in wanted and child.text:
            return normalize(child.text)
    return ""


def child_link(element: ET.Element) -> str:
    for child in element:
        name = tag_name(child)
        if name == "link":
            href = child.attrib.get("href")
            if href:
                return href.strip()
            if child.text:
                return child.text.strip()
    return ""


def fetch_feed(source: Source) -> list[dict]:
    request = urllib.request.Request(
        source.feed,
        headers={
            "User-Agent": "EncontreAquiTechBot/1.0 (+https://github.com/paulogayoREC/elementhus1)",
            "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
    )

    with urllib.request.urlopen(request, timeout=18) as response:
        raw = response.read()

    root = ET.fromstring(raw)
    root_name = tag_name(root)

    if root_name == "feed":
        entries = [child for child in root if tag_name(child) == "entry"]
    else:
        entries = [
            item
            for channel in root.iter()
            if tag_name(channel) == "channel"
            for item in channel
            if tag_name(item) == "item"
        ]

    items = []
    for entry in entries:
        title = child_text(entry, {"title"})
        url = child_link(entry)
        published = child_text(entry, {"pubdate", "published", "updated", "date"})
        summary = child_text(entry, {"description", "summary", "content", "encoded"})
        parsed_date = parse_date(published)

        if not title or not url or not parsed_date:
            continue

        items.append(
            {
                "title": title,
                "source": source.name,
                "url": url,
                "date": parsed_date.date().isoformat(),
                "summary": summary,
                "sourceBias": source.bias,
                "parsedDate": parsed_date,
            }
        )

    return items


def score_item(item: dict, category: str) -> int:
    haystack = f"{item['title']} {item.get('summary', '')}".casefold()
    title = item["title"].casefold()

    if any(keyword in title for keyword in EXCLUDED_TITLE_KEYWORDS):
        return 0

    score = sum(1 for keyword in CATEGORY_KEYWORDS[category] if keyword.casefold() in haystack)

    if item.get("sourceBias") == category:
        score += 3

    if category == "tutoriais" and ("how to" in haystack or "como " in haystack):
        score += 3

    if category == "alertas" and item["source"] == "The Hacker News":
        score += 3

    return score


def collect_recent_items() -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)
    collected: list[dict] = []

    for source in SOURCES:
        try:
            items = fetch_feed(source)
        except Exception as exc:  # noqa: BLE001 - feed failures should not stop the update.
            print(f"[warn] Falha ao ler {source.name}: {exc}", file=sys.stderr)
            continue

        collected.extend(item for item in items if item["parsedDate"] >= cutoff)

    return collected


def make_summary(item: dict) -> str:
    summary = normalize(item.get("summary", ""))
    if not summary:
        return f"Conteudo recente de {item['source']} para acompanhar no radar de tecnologia."
    return summary[:210].rstrip(" ,.;:-") + ("." if len(summary) <= 210 else "...")


def public_item(item: dict, category: str, featured: bool) -> dict:
    return {
        "title": item["title"],
        "source": item["source"],
        "url": item["url"],
        "date": item["date"],
        "tag": CATEGORY_TAGS[category],
        "featured": featured,
        "image": CATEGORY_IMAGES[category],
        "summary": make_summary(item),
    }


def build_categories(recent_items: list[dict]) -> dict:
    used_urls: set[str] = set()
    categories: dict = {}

    for category, label in CATEGORY_LABELS.items():
        ranked = sorted(
            (
                (score_item(item, category), item)
                for item in recent_items
                if item["url"] not in used_urls
            ),
            key=lambda pair: (pair[0], pair[1]["parsedDate"]),
            reverse=True,
        )
        chosen = [
            item
            for score, item in ranked
            if score >= CATEGORY_MIN_SCORE[category]
        ][:ITEMS_PER_CATEGORY]

        for item in chosen:
            used_urls.add(item["url"])

        output_items = [
            public_item(item, category, index == 0)
            for index, item in enumerate(chosen)
        ]

        for seed in SEED_ITEMS[category]:
            if len(output_items) >= ITEMS_PER_CATEGORY:
                break
            if seed["url"] in used_urls:
                continue
            output_items.append({**seed, "featured": len(output_items) == 0})
            used_urls.add(seed["url"])

        if output_items:
            output_items[0]["featured"] = True
            for item in output_items[1:]:
                item["featured"] = False

        categories[category] = {
            "label": label,
            "items": output_items,
        }

    return categories


def main() -> int:
    recent_items = collect_recent_items()
    payload = {
        "updatedAt": datetime.now(timezone.utc).date().isoformat(),
        "refreshEveryDays": 2,
        "categories": build_categories(recent_items),
    }

    content = "window.editorialData = "
    content += json.dumps(payload, ensure_ascii=False, indent=2)
    content += ";\n"

    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Curadoria atualizada em {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
