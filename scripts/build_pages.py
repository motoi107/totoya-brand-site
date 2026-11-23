"""Build the public TOTOYA site from its shared Kamata layout and page sections."""
from html import escape
from site_assets import ROOT, asset_url
import re
import json
from site_languages import LANGUAGES, render_page, local_route

from kamata_company import company_content, privacy_content
from kamata_sections import STORY_SCENES, intro, news, signatures, story, takeaway
from kamata_visit import menu_section, locations_section, booking_dialog

ORIGIN = "https://www.totoyahawaii.com"
LOGO = "/assets/totoya-official-logo.webp"
INSTAGRAM = "https://www.instagram.com/totoya_hawaii/"


def stacked_logo():
    return (f'<span class="stacked-logo" aria-hidden="true"><span class="logo-emblem"><img src="{LOGO}" width="1059" height="450" alt=""></span>'
            f'<span class="logo-word"><img src="{LOGO}" width="1059" height="450" alt=""></span></span>')


def booking_link(kind):
    if kind == "order":
        return '<a href="/order.html" data-booking="order" aria-haspopup="dialog">Order online</a>'
    return '<a href="/locations.html#reservations" data-booking="reserve" aria-haspopup="dialog">Reservations</a>'


def rail():
    return f'''<header class="site-rail" aria-label="TOTOYA">
      <div class="rail-branding">
        <a class="rail-logo" href="/" aria-label="TOTOYA home">{stacked_logo()}<img class="flat-logo" src="{LOGO}" width="1059" height="450" alt=""></a>
        <p class="rail-copy"><strong>Totoya</strong> <!--RAIL_DESCRIPTOR--></p>
      </div>
      <!--LANGUAGE_MENU-->
      <div class="rail-actions">{booking_link('reserve')}{booking_link('order')}</div>
      <details class="rail-menu"><summary><span class="rail-menu-label">Menu</span></summary><div class="rail-drawer">
        <button class="drawer-close" type="button" aria-label="Close menu">Close ×</button>
        <div class="drawer-brand">{stacked_logo()}<p>Japanese Negitoro<br>&amp; Seafood Bowls</p></div>
        <nav aria-label="Main navigation">
          <a href="/#home">Home</a><a href="/#menu">Our menu</a><a href="/#history">Our story</a>
          {booking_link('reserve')}{booking_link('order')}
          <a href="/#shopinfo">Locations</a><a href="/company/">Funergy Group</a><a href="{INSTAGRAM}">Instagram</a>
        </nav></div></details>
    </header>'''


def company_header():
    return f'''<header class="company-top"><a class="company-logo" aria-label="TOTOYA home" href="/"><img src="{LOGO}" width="1059" height="450" alt=""></a>
    <!--LANGUAGE_MENU--><a class="back-home" href="/">Back to Totoya</a></header>'''


def footer():
    links = (('/#history', 'Our story'), ('/#menu', 'Menu'), ('/#shopinfo', 'Shop info'),
             ('/company/', 'Our company'), ('/company/#careers', 'Careers'),
             ('/company/#contact', 'Contact'), (INSTAGRAM, 'Instagram'))
    nav = ''.join(f'<a href="{href}">{label}</a>' for href, label in links)
    return f'''<footer class="public-footer"><div><a class="footer-logo" aria-label="TOTOYA home" href="/"><img src="{LOGO}" alt="" width="1059" height="450"></a>
      <p>Japanese Negitoro &amp; Seafood Bowls</p><p class="footer-neighborhoods">Kaimuki · Piikoi · Aiea</p></div>
      <nav aria-label="Footer navigation">{nav}</nav>
      <small>© TOTOYA · <a href="/company/">Funergy Group</a> · <a href="/privacy/">Privacy</a> · <a href="/media-credits.html">Credits</a></small></footer>'''


def hero():
    scenes = [{"src": clip, "poster": poster} for _, _, _, _, clip, poster in STORY_SCENES]
    playlist = escape(json.dumps(scenes, separators=(",", ":")), quote=True)
    poster = scenes[0]["poster"]
    return f'''<section class="home-hero" id="home" aria-labelledby="hero-title" data-reel>
      <div class="home-slides">
        <picture class="is-current"><source media="(max-width: 767px), (orientation: landscape) and (max-height: 500px) and (max-width: 1000px)" srcset="{poster}"><img src="/assets/tokujo-meal-hero.webp" width="1536" height="1024" fetchpriority="high" alt="Tokujo negitoro bowl topped with snow crab, sea urchin and salmon roe, served with miso soup on a wooden tray"></picture>
        <picture aria-hidden="true"><img src="/assets/negitoro-yolk-pour.webp" width="1171" height="1640" loading="lazy" alt="Egg yolk sauce poured over a Tokujo negitoro bowl"></picture>
        <picture aria-hidden="true"><img src="/assets/negitoro-counter.webp" width="1303" height="1640" loading="lazy" alt="Negitoro bowls served at the TOTOYA counter"></picture>
      </div>
      <div class="ed-reel-media home-film" aria-hidden="true">
        <img src="{poster}" loading="lazy" width="1080" height="1920" alt="">
        <video muted playsinline preload="none" disablepictureinpicture tabindex="-1" data-playlist="{playlist}"></video>
      </div>
      <button class="ed-reel-toggle hero-film-toggle" type="button" data-film-name="Our story" hidden>Play</button>
      <div class="home-hero-brand"><img class="hero-vertical-logo" src="/assets/totoya-vertical-logo.webp" width="835" height="1883" alt="Totoya" fetchpriority="high">
        <h1 id="hero-title">Negitoro Bowl.<span>The Totoya taste you’ll come back for.</span></h1>
      </div>
      <div class="slide-controls" role="group" aria-label="Top photographs" hidden>
        <button type="button" aria-label="Show the Tokujo meal" aria-pressed="true"></button>
        <button type="button" aria-label="Show egg yolk sauce on a Tokujo bowl" aria-pressed="false"></button>
        <button type="button" aria-label="Show negitoro at the counter" aria-pressed="false"></button>
        <button type="button" class="slide-playback" aria-label="Pause slideshow" data-state="playing"></button>
      </div>
    </section>'''


def credits():
    return f'''<article class="reading-page"><h1>Image &amp; film credits</h1>
    <h2>The Tokujo meal</h2><p>The opening meal photograph is an AI-assisted edit of TOTOYA’s own meal-tray photograph, using our Tokujo product photography for the bowl.</p>
    <h2>Our bowls</h2><p>The menu shows TOTOYA’s dishes. The image in “Totoya at home” is an AI-assisted detail enhancement of TOTOYA’s takeout photograph.</p>
    <h2>Moments at TOTOYA</h2><p>Our kitchen and table scenes come from the <a href="{asset_url('assets/brand-film-clean.mp4')}">TOTOYA brand film</a>. Find more from our team on <a href="{INSTAGRAM}">@totoya_hawaii</a>.</p></article>'''


def write_page(filename, title, description, content, *, styles=(), scripts=(), company=False):
    route = '/' + filename.removesuffix('index.html')
    canonical = ORIGIN + route
    css = ('style', *styles) if company else ('style', *dict.fromkeys((*styles, 'visit')))
    js = scripts if company else tuple(dict.fromkeys(('nav', *scripts, 'visit')))
    if 'id="shopinfo"' in content:
        leaflet = 'assets/leaflet-1.9.4/leaflet'
        css = tuple(name for item in css for name in ((leaflet, item) if item == 'visit' else (item,)))
        js = tuple(name for item in js for name in ((leaflet, item) if item == 'visit' else (item,)))
    style_tags = '\n'.join(f'<link rel="stylesheet" href="{asset_url(name + ".css")}">' for name in css)
    script_tags = '\n'.join(f'<script defer src="{asset_url(name + ".js")}"></script>' for name in js)
    body_class = 'company-site' if company else 'with-rail'
    main_class = 'front-page' if filename == 'index.html' else 'standalone'
    text = f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title><meta name="description" content="{escape(description, quote=True)}"><meta name="theme-color" content="#f8f7f2">
<link rel="canonical" href="{canonical}"><meta property="og:type" content="website"><meta property="og:site_name" content="TOTOYA Hawaii"><meta property="og:title" content="{escape(title, quote=True)}">
<meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{ORIGIN}/assets/tokujo-meal-hero.webp">
<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="16x16 24x24 32x32 48x48 64x64 96x96 144x144 192x192 256x256">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/totoya-icon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/totoya-icon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<!--LANGUAGE_HEAD-->
{style_tags}{script_tags}
</head><body class="{body_class}"><a class="skip-link" href="#main">Skip to content</a>
{company_header() if company else rail()}
<main id="main" class="{main_class}">{content}</main>
{footer()}{'' if company else booking_dialog()}
</body></html>
'''
    for lang in LANGUAGES:
        catalog = CATALOGS.get(lang, {})
        path = ROOT / ('' if lang == 'en' else lang) / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(render_page(text,lang,route,catalog,asset_url('language.js')), encoding='utf-8')
    ROUTES.append(route)


def page_heading(fragment):
    return re.sub(r'<h2(\b[^>]*)>(.*?)</h2>', r'<h1\1>\2</h1>', fragment, count=1, flags=re.S)


CATALOGS = {}
ROUTES = []

def build():
    ROUTES.clear()
    for lang in LANGUAGES:
        if lang != 'en':
            CATALOGS[lang] = json.loads((ROOT / 'translations' / f'{lang}.json').read_text(encoding='utf-8'))
    homepage = ''.join((hero(), intro(), news(), signatures(), menu_section(), story(), locations_section(), takeaway()))
    write_page('index.html', 'TOTOYA — Japanese Negitoro & Seafood Bowls',
               'Fresh Japanese negitoro and seafood bowls in Kaimuki, Piikoi and Aiea. Explore the menu, reserve a table or order pickup.',
               homepage, styles=('home','sections'), scripts=('home','sections'))
    write_page('menu.html', 'Menu · TOTOYA', 'Dine-in menu, seafood bowls and toppings for all three TOTOYA locations.', page_heading(menu_section()))
    write_page('locations.html', 'Locations & reservations · TOTOYA', 'Find TOTOYA in Kaimuki, Piikoi and Aiea. View hours, directions and reservations.', page_heading(locations_section()))
    write_page('order.html', 'Order online · TOTOYA', 'Choose your neighborhood TOTOYA for pickup.', page_heading(takeaway()), styles=('sections',))
    write_page('about.html', 'Our story · TOTOYA', 'Watch the care behind our original negitoro and moments from our kitchen.', page_heading(story()), styles=('sections',), scripts=('sections',))
    write_page('craft.html', 'Our original negitoro · TOTOYA', 'Meet our original negitoro and the toppings that make it yours.', page_heading(intro()) + signatures(), styles=('sections',), scripts=('sections',))
    news_archive = page_heading(news()).replace('<li><span class="ed-kicker">Coming soon', '<li id="kapolei"><span class="ed-kicker">Coming soon').replace('<li><span class="ed-kicker">Reservations', '<li id="reservation-news"><span class="ed-kicker">Reservations')
    news_archive += '''<article class="reading-page" id="handroll"><p class="section-kicker">NOVEMBER 17, 2026</p><h2>Hand-roll night, made easy.</h2><p>Our Hand-roll Set serves 2–3 and is available for takeout at Kaimuki.</p><p><a class="line-link" href="https://www.instagram.com/totoya_hawaii/p/Df3TPyGmlrC/">See the announcement from our kitchen</a></p></article>'''
    write_page('news.html', 'News · TOTOYA', 'News, openings and reservations at TOTOYA in Hawai‘i.', news_archive, styles=('sections',))
    write_page('company/index.html', 'Our company · Funergy Group | TOTOYA', 'Meet the company behind Totoya, our sister restaurants and our people.', company_content(), styles=('company',), company=True)
    write_page('privacy/index.html', 'Privacy · TOTOYA', 'How locations, bookings and other visitor services work.', privacy_content(), styles=('company',), company=True)
    write_page('media-credits.html', 'Image & film credits · TOTOYA', 'Photography and films from the TOTOYA team.', credits(), company=True)
    careers = '''<article class="reading-page"><p class="section-kicker">GROW WITH US</p><h1>Bring your energy.<br>Find your place.</h1>
    <p>Enjoy good food, care about people and want to be part of a team? Explore opportunities with Totoya and our sister restaurants.</p>
    <p><a class="line-link" href="https://funergygroup.com/hiring">Explore careers</a> &nbsp; <a class="line-link" href="https://funergygroup.com/apply">Apply to join our team</a></p>
    <p><a href="/company/#careers">Meet Funergy Group.</a></p></article>'''
    write_page('recruit.html', 'Careers · TOTOYA', 'Join the team at Totoya and Funergy Group.', careers, company=True)


    urls = [f'<url><loc>{ORIGIN+local_route(code,route)}</loc></url>' for route in ROUTES for code in LANGUAGES]
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+'\n'.join(urls)+'\n</urlset>\n', encoding='utf-8')


if __name__ == '__main__':
    build()
