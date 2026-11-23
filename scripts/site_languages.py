"""Localize first-party restaurant pages at build time."""

import json
import re
from html import escape, unescape
from html.parser import HTMLParser

ORIGIN = "https://www.totoyahawaii.com"

LANGUAGES = {
    "en": "English",
    "zh-Hans": "简体中文",
    "zh-Hant": "繁體中文",
    "ko": "한국어",
    "es": "Español",
    "fr": "Français",
    "ja": "日本語",
}

RAIL_LINES = ("Japanese", "Negtoro", "&", "Seafood Bowls")

UI_MESSAGES = (
    "Language",
    "Select language",
    "Pause slideshow",
    "Play slideshow",
    "Pause",
    "Play",
    "Pause background video · {0}",
    "Play background video · {0}",
    "Open Google Maps without sharing location",
    "Getting your current location…",
    "your location",
    "Closest to {0} by straight-line distance: TOTOYA {1}.",
    "Choose a landmark to find a nearby TOTOYA.",
    "Finding your nearest TOTOYA…",
    "Location unavailable. Choose a landmark to find a nearby TOTOYA.",
    "View shop details",
    "Directions from my location",
    "Zoom in",
    "Zoom out",
    "Close popup",
    "Map",
    "OpenStreetMap contributors",
)

LOCAL_ATTRS = {"alt", "title", "aria-label", "data-label", "data-film-name"}
META_TEXT = {"description", "og:description", "og:title"}

# HTMLParser folds names to lowercase, but inline SVG uses names such as viewBox.
TAG_NAME = re.compile(r"<([^\s/>]+)")
ATTRIBUTE = re.compile(
    r"""\s+([^\s=/>]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?"""
)
# Only element bodies may become linked phrases. Ignore HTML-looking text inside
# comments and scripts, and allow '>' inside quoted attribute values.
TAG_END = r"""(?:[^>"']|"[^"]*"|'[^']*')*>"""
PARAGRAPH = re.compile(
    rf"<!--.*?-->|<(?P<raw>script|style)\b{TAG_END}.*?</(?P=raw)\s*>"
    rf"|<p\b{TAG_END}(?P<body>.*?)</p\s*>",
    re.DOTALL | re.IGNORECASE,
)
INLINE_LINK = re.compile(rf"<a\b{TAG_END}.*?</a\s*>", re.DOTALL | re.IGNORECASE)
SLOT = re.compile(r"\{(\d+)\}")


def key_for(value):
    """Return the normalized English key, or an empty string for non-copy."""
    normalized = " ".join(value.split())
    if not re.search(r"[A-Za-z]", normalized):
        return ""
    if normalized.startswith(("https://", "mailto:")) or "@" in normalized:
        return ""
    return normalized


def local_route(lang, route):
    """Prefix a root-relative customer page route with its language directory."""
    return route if lang == "en" else f"/{lang}{route}"


class Page(HTMLParser):
    """Collect English catalog keys and serialize HTML in the chosen language."""

    def __init__(
        self,
        catalog=None,
        lang="en",
        route="",
        render_switcher=None,
        *,
        head_markup=None,
    ):
        super().__init__(convert_charrefs=True)
        self.keys = set()
        self.catalog = {} if catalog is None else catalog
        self.lang = lang
        self.route = route
        self.render_switcher = render_switcher
        self.head_markup = head_markup
        self.out = []
        self.in_script = False
        self.tag_spellings = {}

    def translate(self, value):
        key = key_for(value)
        if not key:
            return value
        self.keys.add(key)
        if self.lang == "en":
            return value

        leading_space = " " if value[:1].isspace() else ""
        trailing_space = " " if value[-1:].isspace() else ""
        return leading_space + self.catalog[key] + trailing_space

    def handle_decl(self, declaration):
        self.out.append(f"<!{declaration}>")

    def handle_comment(self, comment):
        if comment == "LANGUAGE_MENU" and self.render_switcher is not None:
            self.out.append(self.render_switcher(self.lang, self.route, self.catalog))
        elif comment == "RAIL_DESCRIPTOR":
            lines = RAIL_LINES if self.lang == "en" else self.catalog[" ".join(RAIL_LINES)].splitlines()
            separator = "" if self.lang in {"ja", "zh-Hans", "zh-Hant"} else " "
            self.out.append(separator.join(f"<span>{escape(line)}</span>" for line in lines))
        elif comment == "LANGUAGE_HEAD" and self.head_markup is not None:
            self.out.append(self.head_markup)
        else:
            self.out.append(f"<!--{comment}-->")

    def handle_data(self, value):
        if self.in_script:
            self.out.append(value)
        else:
            self.out.append(escape(self.translate(value), quote=False))

    def handle_starttag(self, tag, attrs):
        self.write_start_tag(tag, attrs, ">")
        if tag in {"script", "style"}:
            self.in_script = True

    def handle_startendtag(self, tag, attrs):
        self.write_start_tag(tag, attrs, "/>")

    def handle_endtag(self, tag):
        self.out.append(f"</{self.tag_spellings.get(tag, tag)}>")
        if tag in {"script", "style"}:
            self.in_script = False

    def write_start_tag(self, tag, attrs, ending):
        raw = self.get_starttag_text()
        tag_match = TAG_NAME.match(raw)
        spelling = tag_match.group(1)
        self.tag_spellings[tag] = spelling
        names = {
            name.group(1).lower(): name.group(1)
            for name in ATTRIBUTE.finditer(raw, tag_match.end())
        }
        attributes = self.localized_attributes(tag, dict(attrs))

        parts = ["<", spelling]
        for key, value in attributes.items():
            parts.extend((" ", names.get(key, key)))
            if value is not None:
                parts.append(f'="{escape(value, quote=True)}"')
        parts.append(ending)
        self.out.append("".join(parts))

    def localized_attributes(self, tag, attributes):
        if tag == "html":
            attributes["lang"] = self.lang
        for key in LOCAL_ATTRS.intersection(attributes):
            if attributes[key]:
                attributes[key] = self.translate(attributes[key])

        if tag == "meta":
            fields = {
                (attributes.get(key) or "").lower()
                for key in ("property", "name")
            }
            if self.route and "og:url" in fields:
                attributes["content"] = ORIGIN + local_route(self.lang, self.route)
            elif fields & META_TEXT and attributes.get("content"):
                attributes["content"] = self.translate(attributes["content"])
        elif tag == "link" and self.route:
            relationships = (attributes.get("rel") or "").lower().split()
            if "canonical" in relationships:
                attributes["href"] = ORIGIN + local_route(self.lang, self.route)
        elif tag == "a":
            href = attributes.get("href") or ""
            if href.startswith("/") and not href.startswith(("/assets/", "//")):
                attributes["href"] = local_route(self.lang, href)

        return attributes


def language_menu(lang, route, catalog):
    name = escape(catalog.get("Select language", "Select language"), quote=True)
    links = []
    for code, label in LANGUAGES.items():
        current = ' aria-current="true"' if code == lang else ""
        href = escape(local_route(code, route), quote=True)
        links.append(
            f'<a href="{href}" hreflang="{code}" lang="{code}"{current}>{label}</a>'
        )

    return (
        f'<details class="language-menu"><summary aria-label="{name}">'
        f'<span lang="{lang}">{LANGUAGES[lang]}</span></summary>'
        f'<nav class="language-panel" aria-label="{name}">{"".join(links)}</nav></details>'
    )


def language_head(lang, route, catalog, runtime_script):
    default_url = escape(ORIGIN + route, quote=True)
    tags = []
    for code in LANGUAGES:
        url = escape(ORIGIN + local_route(code, route), quote=True)
        tags.append(f'<link rel="alternate" hreflang="{code}" href="{url}">')
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{default_url}">')

    strings = {} if lang == "en" else {key: catalog[key] for key in UI_MESSAGES}
    payload = json.dumps(strings, ensure_ascii=False, separators=(",", ":"))
    # Escape the start of any HTML tag before embedding JSON in a script element.
    payload = payload.replace("<", "\\u003c")
    tags.append(f'<script type="application/json" id="ui-strings">{payload}</script>')
    tags.append(f'<script defer src="{escape(runtime_script, quote=True)}"></script>')
    return "\n".join(tags)


def rich_paragraph(body, lang, catalog):
    """Translate a linked paragraph as one sentence, allowing links to move."""
    anchors = []

    def mark_link(match):
        index = len(anchors)
        anchors.append(match.group())
        return "{" + str(index) + "}"

    source = INLINE_LINK.sub(mark_link, body)
    if not anchors or "<" in source:
        return None
    key = key_for(unescape(source))
    if key not in catalog:
        return None

    translated = catalog[key]
    indices = [int(index) for index in SLOT.findall(translated)]
    if sorted(indices) != list(range(len(anchors))):
        raise ValueError(f"Incorrect link placeholders in {lang}: {key}")

    links = []
    for anchor in anchors:
        child = Page(catalog, lang)
        child.feed(anchor)
        child.close()
        links.append("".join(child.out))

    return SLOT.sub(
        lambda slot: links[int(slot.group(1))],
        escape(translated, quote=False),
    )


def render_page(template, lang, route, catalog, runtime_script):
    head = language_head(lang, route, catalog, runtime_script)
    page = Page(catalog, lang, route, language_menu, head_markup=head)
    cursor = 0
    if lang != "en":
        for paragraph in PARAGRAPH.finditer(template):
            body = paragraph.group("body")
            if body is None:
                continue
            translated = rich_paragraph(body, lang, catalog)
            if translated is None:
                continue
            # The main parser still handles the paragraph's own attributes.
            page.feed(template[cursor:paragraph.start("body")])
            page.out.append(translated)
            cursor = paragraph.end("body")

    page.feed(template[cursor:])
    page.close()
    return "".join(page.out)
