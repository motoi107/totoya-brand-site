"""Render TOTOYA's static pages. Run with python3 scripts/build_pages.py."""
from pathlib import Path
from html import escape
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parents[1]
INSTAGRAM = 'https://www.instagram.com/totoya_hawaii/'
HANDROLL_POST = 'https://www.instagram.com/totoya_hawaii/p/Df3TPyGmlrC/'
RESERVATION_POST = 'https://www.instagram.com/totoya_hawaii/p/DfEL_vcAV1K/'
KAIMUKI_RESERVE = 'https://www.google.com/maps/reserve/v/dine/c/YEk5ApL2WWk'
AIEA_RESERVE = 'https://www.google.com/maps/reserve/v/dine/c/HFvPblyZHtM'
STORES = [
    dict(id='kaimuki', name='Kaimuki', area='Honolulu', address='1127 12th Ave, Honolulu, HI 96816', phone='(808) 600-5017', tel='+18086005017', order='https://order.toasttab.com/online/totoya-hawaii', reserve=KAIMUKI_RESERVE, google='https://maps.app.goo.gl/ytFYtxSXhNfaw7ar9', lunch='11:00 AM – 3:00 PM', dinner='5:00 PM – 9:00 PM'),
    dict(id='piikoi', name='Ala Moana / Piikoi', area='Honolulu', address='436 Piikoi Street B, Honolulu, HI 96814', phone='(808) 260-4492', tel='+18082604492', order='https://order.toasttab.com/online/totoya-ala-moana-436-piikoi-st-suite-b', reserve=None, google='https://maps.app.goo.gl/G2F14NHWvr6UU4Pr6', lunch='11:00 AM – 2:30 PM', dinner='5:00 PM – 8:30 PM'),
    dict(id='aiea', name='Aiea', area='Central O‘ahu', address='99-115 Aiea Heights Dr. #250, Aiea, HI 96701', phone='(808) 487-6808', tel='+18084876808', order='https://order.toasttab.com/online/totoya-aiea-nro-99-115-aiea-heights-drive-unit-250', reserve=AIEA_RESERVE, google='https://maps.app.goo.gl/aSD6FYd2DPoCQg7B7', lunch='11:00 AM – 2:30 PM', dinner='5:00 PM – 8:30 PM'),
]
NAV = [('menu.html', 'Menu'), ('about.html', 'Our story'), ('locations.html', 'Locations'), ('locations.html#reservations', 'Reservations'), ('order.html', 'Order takeout')]
FOOTER = [('menu.html', 'Menu'), ('about.html', 'Our story'), ('craft.html', 'The bowl'), ('locations.html', 'Locations'), ('locations.html#reservations', 'Reservations'), ('order.html', 'Order takeout'), ('news.html', 'News'), ('recruit.html', 'Join the team')]

def external(url, label, cls='text-link'):
    return f'<a class="{cls}" href="{escape(url, quote=True)}" target="_blank" rel="noopener">{label}</a>'

def brand():
    return '<a class="brand" href="index.html" aria-label="TOTOYA home"><span class="brand-word">TOTO<span>YA</span><small>Japanese Negitoro &amp; Seafood Bowls</small></span></a>'

def header(current):
    links = ''.join(f'<li><a {"class=\"nav-cta\" " if path == "order.html" else ""}href="{path}"{" aria-current=\"page\"" if path == current else ""}>{label}</a></li>' for path, label in NAV)
    return f'''<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap header-inner">{brand()}
<button class="nav-toggle" aria-label="Open navigation menu" aria-controls="primary-nav" aria-expanded="false">Menu</button>
<nav id="primary-nav" class="primary-nav" aria-label="Main navigation"><ul class="nav-list">{links}</ul></nav></div></header>
<div class="announcement"><a href="news.html#kapolei">Kapolei · Opening planned for late February</a></div>
<nav class="quick-actions" aria-label="Quick actions"><a href="menu.html">Menu</a><a href="locations.html#reservations">Reservations</a><a href="order.html">Order takeout</a></nav>'''

def footer():
    links = ''.join(f'<a href="{path}">{label}</a>' for path, label in FOOTER)
    return f'''<footer class="site-footer"><div class="wrap footer-main"><div>{brand()}<p>Kaimuki · Ala Moana / Piikoi · Aiea</p>{external(INSTAGRAM, '@totoya_hawaii')}</div>
<nav class="footer-links" aria-label="Footer navigation">{links}</nav></div>
<div class="wrap footer-bottom"><span>© <span data-year>2026</span> TOTOYA. All rights reserved.</span><span>A Funergy Group concept.</span></div></footer>
<script src="nav.js" defer></script>'''

def document(filename, title, description, content, home=False):
    canonical = 'https://www.totoyahawaii.com/' + ('' if home else filename)
    text = f'''<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#142c4e"><title>{escape(title)}</title>
<meta name="description" content="{escape(description, quote=True)}"><link rel="canonical" href="{canonical}">
<meta property="og:type" content="website"><meta property="og:title" content="{escape(title, quote=True)}"><meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="https://www.totoyahawaii.com/assets/menu-take.jpg"><meta property="og:site_name" content="TOTOYA Hawaii">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="style.css">
</head><body{(' class="home"' if home else '')}>{header(filename)}
<main id="main">{content}</main>{footer()}</body></html>'''
    (ROOT / filename).write_text(text, encoding='utf-8')

def page_hero(eyebrow, title, intro):
    return f'<section class="page-hero"><div class="wrap"><span class="eyebrow">{eyebrow}</span><h1>{title}</h1><p class="intro">{intro}</p></div></section>'

def locations(compact=False):
    cards = []
    for s in STORES:
        tag = 'Reservations available' if s['reserve'] else 'Dine-in &amp; takeout'
        reserve = ''
        if s['reserve']:
            reserve = external(s['reserve'], 'Reserve '+s['name'], 'btn btn--outline')
        hours = '' if compact else f'<p class="hours">Open daily<br>Lunch {s["lunch"]}<br>Dinner {s["dinner"]}</p>'
        cards.append(f'''<article class="location" id="{s['id']}"><h3>{s['name']}</h3><span class="tag">{tag}</span><address>{s['address']}</address>
{hours}<a class="phone" href="tel:{s['tel']}">{s['phone']}</a>
<div class="btn-row">{reserve}{external(s['order'], 'Order takeout', 'btn btn--outline')}</div>
{external(s['google'], 'Google Maps')}</article>''')
    return '<div class="locations-grid">'+''.join(cards)+'</div>'

def kapolei():
    return '''<div class="new-location"><div><span class="eyebrow">Coming soon</span><h3>Kapolei</h3></div><div><p>Opening planned for late February. The opening date, address, and further details will be announced.</p><a class="text-link" href="news.html#kapolei">Opening updates</a></div></div>'''

def reservation_band():
    return f'''<section class="reservation-band" id="reservations"><div class="wrap reservation-inner"><div><h2>Reservations</h2><p>Kaimuki and Aiea now accept reservations. Book your table online at either location, or call the restaurant.</p></div><div class="btn-row">{external(KAIMUKI_RESERVE, 'Reserve Kaimuki', 'btn btn--outline')}{external(AIEA_RESERVE, 'Reserve Aiea', 'btn btn--outline')}</div></div></section>'''

home = '''<section class="hero" aria-label="TOTOYA brand film"><div class="hero-media"><video id="brand-film" data-src="assets/hero-loop.mp4" poster="assets/hero-poster.jpg" muted loop playsinline preload="none" aria-label="TOTOYA seafood bowls and restaurant brand film"></video><button id="film-control" class="film-control" type="button" hidden>Play film</button></div></section>
<div class="home-intro wrap"><h1>TOTOYA</h1><p class="brand-subtitle">Japanese Negitoro &amp; Seafood Bowls</p><p class="intro">Negitoro and seafood bowls in Kaimuki, Ala Moana / Piikoi, and Aiea.</p><div class="btn-row"><a class="btn" href="menu.html">Menu</a><a class="btn btn--outline" href="locations.html#reservations">Reservations</a><a class="btn btn--outline" href="order.html">Order takeout</a></div></div>
<section class="section"><div class="wrap editorial-row"><div class="editorial-copy"><span class="eyebrow">Menu</span><h2>Negitoro &amp; seafood bowls</h2><p>Explore our original negitoro bowls, with salmon roe, uni, and snow crab, alongside our sashimi selection.</p><a class="text-link" href="menu.html">View menu</a></div><div class="editorial-media"><img src="assets/menu-take.jpg" width="720" height="603" alt="Take takeout bowl with original negitoro and salmon roe" loading="lazy"><p class="note">Take · Takeout</p></div></div></section>
<section class="section"><div class="wrap editorial-row"><div class="editorial-media"><img src="assets/handroll.jpg" width="540" height="720" alt="TOTOYA Hand-roll Set seafood assortment" loading="lazy"></div><div class="editorial-copy"><span class="eyebrow">Kaimuki exclusive · Takeout only</span><h2>Hand-roll Set</h2><p>$75 · Serves 2–3</p><p>Seafood, 600g of sushi rice, and 20 nori sheets for hand rolls at home.</p><div class="inline-actions"><a class="text-link" href="menu.html#handroll">View the set</a>'''+external(STORES[0]['order'], 'Order from Kaimuki')+'''</div></div></div></section>'''
home += '<section class="section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">Visit us</span><h2>Locations &amp; reservations</h2></div><p class="intro">Reservations are available at Kaimuki and Aiea. All three shops offer takeout.</p></div>'+locations(compact=True)+kapolei()+'</div></section>'
home += f'''<section class="section"><div class="wrap"><div class="section-heading"><h2>News</h2><a class="text-link" href="news.html">All updates</a></div><div class="news-grid"><article class="news-card"><time datetime="2026-11-17">NOVEMBER 17, 2026</time><h3>TOTOYA Hand-roll Set</h3><p>Available for takeout at Kaimuki.</p>{external(HANDROLL_POST, 'View on Instagram')}</article><article class="news-card"><time datetime="2026-10-28">OCTOBER 28, 2026</time><h3>Reservations now available</h3><p>Book your visit to Kaimuki or Aiea.</p><a class="text-link" href="locations.html#reservations">Reservations</a></article></div></div></section>'''
document('index.html', 'TOTOYA — Japanese Negitoro & Seafood Bowls', 'TOTOYA — Japanese Negitoro & Seafood Bowls in Kaimuki, Ala Moana / Piikoi and Aiea. Reservations, takeout, and a Kaimuki-exclusive Hand-roll Set. Kapolei opening planned for late February.', home, True)

menu_rows = ''.join(f'<div class="menu-item"><h3>{name}</h3><span class="price">${price}</span><p>{desc}</p></div>' for name,price,desc in [
('Ume 梅','18.90','Original negitoro.'),
('Take 竹','26.90','Original negitoro and salmon roe.'),
('Matsu 松','34.90','Original negitoro, salmon roe, and uni.'),
('Tokujo 特上','38.90','Original negitoro, salmon roe, uni, and snow crab.')])
menu = page_hero('TOTOYA', 'Menu', 'Negitoro and seafood bowls, plus a Hand-roll Set available for takeout at Kaimuki.')
menu += f'''<section class="page-body"><div class="wrap"><div class="menu-intro"><div class="editorial-media"><img src="assets/menu-take.jpg" width="720" height="603" alt="Take takeout bowl with original negitoro and salmon roe" loading="eager"><p class="note">Take · Takeout</p></div><div><span class="eyebrow">Takeout prices</span><h2>Negitoro bowls</h2><div class="menu-list">{menu_rows}</div><p class="note">Prices shown are for takeout. Dine-in offerings and prices may differ. Check your location’s menu for current pricing and availability.</p><a class="text-link" href="order.html">Full takeout menus</a></div></div>
<div class="feature-block" id="handroll"><div class="editorial-row"><div class="editorial-copy"><span class="eyebrow">Kaimuki exclusive · Takeout only</span><h2>Hand-roll Set</h2><p><strong>$75 · Serves 2–3</strong></p><ul class="menu-details"><li>600g of sushi rice and 20 nori sheets</li><li>Original negitoro, tuna, salmon, and scallop sashimi</li><li>House-marinated shoyu tuna poke, snow crab, salmon roe, tobiko, mentaiko, and cucumber</li></ul><div class="btn-row">{external(STORES[0]['order'], 'Order from Kaimuki', 'btn btn--outline')}</div>{external(HANDROLL_POST, 'View on Instagram')}</div><div class="editorial-media"><img src="assets/handroll.jpg" width="540" height="720" alt="TOTOYA Hand-roll Set seafood assortment from Kaimuki" loading="lazy"></div></div></div>
<div class="prose"><h2>Sashimi bowls, toppings &amp; sides</h2><p>See your location’s full menu for the sashimi selection, extra toppings, and sides.</p><div class="btn-row"><a class="btn" href="order.html">Full takeout menus</a><a class="btn btn--outline" href="locations.html#reservations">Reservations</a></div></div></div></section>'''
document('menu.html', 'TOTOYA Menu — Negitoro & Seafood Bowls', 'TOTOYA Ume, Take, Matsu and Tokujo seafood bowls and the Kaimuki-exclusive $75 Hand-roll Set for 2–3. View takeout menus.', menu)

loc = page_hero('Visit us', 'Locations', 'TOTOYA in Kaimuki, Ala Moana / Piikoi, and Aiea. Reservations are available at Kaimuki and Aiea.')
loc += '<section class="page-body"><div class="wrap">'+locations()+kapolei()+'</div></section>'+reservation_band()
document('locations.html', 'TOTOYA Locations & Reservations — Kaimuki, Piikoi & Aiea', 'Hours, addresses, directions, reservations, and takeout for TOTOYA Kaimuki, Ala Moana / Piikoi, and Aiea. Kapolei planned for late February.', loc)

order = page_hero('TOTOYA', 'Order takeout', 'Choose your location to view the takeout menu and available pickup times.')
order += '<section class="page-body"><div class="wrap"><p class="note">For a table at Kaimuki or Aiea, visit <a href="locations.html#reservations">Reservations</a>.</p>'+locations()+'<div class="feature-block"><h2>Hand-roll Set</h2><p>$75 · Serves 2–3 · Kaimuki takeout only</p><p>600g of sushi rice, 20 nori sheets, and a selection of seafood for hand rolls at home.</p><a class="text-link" href="menu.html#handroll">View the set</a></div></div></section>'
document('order.html', 'Order TOTOYA Takeout — Kaimuki, Piikoi & Aiea', 'Order TOTOYA seafood bowls for pickup in Kaimuki, Ala Moana / Piikoi, or Aiea. Hand-roll Sets are available at Kaimuki only.', order)

about = page_hero('TOTOYA', 'About TOTOYA', 'Japanese Negitoro &amp; Seafood Bowls')
about += '''<section class="page-body"><div class="wrap prose"><p>TOTOYA serves negitoro and seafood bowls in Kaimuki, Ala Moana / Piikoi, and Aiea.</p><h2>Our menu</h2><p>Our original negitoro bowls include combinations of salmon roe, uni, and snow crab. Explore the sashimi selection, or choose the Kaimuki-exclusive Hand-roll Set to enjoy at home.</p><h2>Visit us</h2><p>Join us for lunch or dinner, or order takeout. Kaimuki and Aiea now accept reservations. Our Kapolei location is planned to open in late February.</p><div class="btn-row"><a class="btn" href="menu.html">Menu</a><a class="btn btn--outline" href="locations.html">Locations</a></div></div></section>'''
document('about.html', 'About TOTOYA — Japanese Negitoro & Seafood Bowls', 'TOTOYA serves Japanese negitoro and seafood bowls in Kaimuki, Piikoi, and Aiea. A Funergy Group concept.', about)

craft = page_hero('TOTOYA', 'The bowl', 'Original negitoro, sashimi, and seafood over rice.')
craft += '''<section class="page-body"><div class="wrap prose"><h2>Original negitoro</h2><p>Ume features our original negitoro. Take adds salmon roe. Matsu includes salmon roe and uni, while Tokujo adds snow crab.</p><h2>Sashimi &amp; toppings</h2><p>Explore the sashimi bowl selection and additional toppings on each location’s menu.</p><h2>Hand rolls at home</h2><p>The Kaimuki Hand-roll Set includes seafood, 600g of sushi rice, and 20 nori sheets for 2–3 people. Available for takeout only.</p><div class="btn-row"><a class="btn" href="menu.html">Menu</a><a class="btn btn--outline" href="order.html">Order takeout</a></div></div></section>'''
document('craft.html', 'The TOTOYA Bowl — Negitoro, Sashimi & Seafood', 'Explore TOTOYA negitoro bowls with salmon roe, uni, and snow crab, and the Kaimuki Hand-roll Set.', craft)

news = page_hero('TOTOYA', 'News', 'Menu updates and announcements from TOTOYA.')
news += f'''<section class="page-body"><div class="wrap news-list"><article class="news-card" id="kapolei"><span class="eyebrow">Coming soon</span><h2>TOTOYA Kapolei</h2><p>Our Kapolei location is planned to open in late February. The opening date, address, and further details will be announced.</p>{external(INSTAGRAM, 'Follow TOTOYA on Instagram')}</article>
<article class="news-card" id="handroll"><time datetime="2026-11-17">NOVEMBER 17, 2026</time><h2>TOTOYA Hand-roll Set</h2><p>Available exclusively at Kaimuki for takeout. The $75 set serves 2–3, with 600g of sushi rice, 20 nori sheets, and seafood for hand rolls at home.</p><div class="inline-actions">{external(HANDROLL_POST, 'View on Instagram')}<a class="text-link" href="menu.html#handroll">View the set</a></div></article>
<article class="news-card" id="reservation-news"><time datetime="2026-10-28">OCTOBER 28, 2026</time><h2>Reservations at Kaimuki &amp; Aiea</h2><p>Kaimuki and Aiea now accept reservations. Book your table online at either location, or call the restaurant.</p><div class="inline-actions"><a class="text-link" href="locations.html#reservations">Reservations</a>{external(RESERVATION_POST, 'View on Instagram')}</div></article></div></section>'''
document('news.html', 'TOTOYA News — Kapolei, Hand-roll Set & Reservations', 'TOTOYA Kapolei opening planned for late February. Kaimuki Hand-roll Sets and reservations at Kaimuki and Aiea.', news)

recruit = page_hero('TOTOYA', 'Join our team', 'Contact us to ask about current opportunities.')
recruit += '''<section class="page-body"><div class="wrap prose"><p>Please contact a TOTOYA location to ask about current openings and how to apply.</p><div class="btn-row"><a class="btn" href="tel:+18086005017">Call Kaimuki</a><a class="btn btn--outline" href="locations.html">All locations</a></div></div></section>'''
document('recruit.html', 'Join the TOTOYA Team', 'Contact TOTOYA in Kaimuki, Piikoi, or Aiea to ask about restaurant opportunities and how to apply.', recruit)
print('Rendered 8 static TOTOYA pages.')
