"""Render TOTOYA's static pages. Run with python3 scripts/build_pages.py."""
from pathlib import Path
from html import escape
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parents[1]
INSTAGRAM = 'https://www.instagram.com/totoya_hawaii/'
HANDROLL_POST = 'https://www.instagram.com/totoya_hawaii/p/Df3TPyGmlrC/'
RESERVATION_POST = 'https://www.instagram.com/totoya_hawaii/p/DfEL_vcAV1K/'
KAIMUKI_RESERVE = 'https://toast.app/r/totoya-hawaii'
STORES = [
    dict(id='kaimuki', name='Kaimuki', area='Honolulu', address='1127 12th Ave, Honolulu, HI 96816', phone='(808) 600-5017', tel='+18086005017', order='https://order.toasttab.com/online/totoya-hawaii', reserve=KAIMUKI_RESERVE),
    dict(id='piikoi', name='Ala Moana / Piikoi', area='Honolulu', address='436 Piikoi Street B, Honolulu, HI 96814', phone='(808) 260-4492', tel='+18082604492', order='https://order.toasttab.com/online/totoya-ala-moana-436-piikoi-st-suite-b', reserve=None),
    dict(id='aiea', name='Aiea', area='Central O‘ahu', address='99-115 Aiea Heights Dr. #250, Aiea, HI 96701', phone='(808) 487-6808', tel='+18084876808', order='https://order.toasttab.com/online/totoya-aiea-nro-99-115-aiea-heights-drive-unit-250', reserve='tel:+18084876808'),
]
NAV = [('menu.html', 'Menu'), ('about.html', 'Our story'), ('locations.html', 'Locations'), ('locations.html#reservations', 'Reservations'), ('order.html', 'Order takeout')]
FOOTER = [('menu.html', 'Menu'), ('about.html', 'Our story'), ('craft.html', 'The bowl'), ('locations.html', 'Locations'), ('locations.html#reservations', 'Reservations'), ('order.html', 'Order takeout'), ('news.html', 'News'), ('recruit.html', 'Join the team')]

def external(url, label, cls='text-link'):
    return f'<a class="{cls}" href="{escape(url, quote=True)}" target="_blank" rel="noopener">{label}</a>'

ANNOUNCEMENT = '<div class="announcement"><a href="news.html#kapolei"><span>COMING SOON</span> TOTOYA Kapolei · Opening late February</a></div>'

def brand():
    return '<a class="brand" href="index.html" aria-label="TOTOYA home"><img class="brand-image" src="assets/totoya-official-logo.webp" width="1059" height="450" alt=""><span class="brand-subtitle">Japanese Negitoro &amp; Seafood Bowls</span></a>'

def header(current):
    links = []
    for path, label in NAV:
        css = 'class="nav-cta" ' if path == 'order.html' else ''
        selected = ' aria-current="page"' if path == current else ''
        links.append(f'<li><a {css}href="{path}"{selected}>{label}</a></li>')
    links = ''.join(links)
    if current == 'index.html':
        return f'''<a class="skip-link" href="#main">Skip to content</a>
<header class="home-rail">
  <a class="rail-brand" href="index.html" aria-label="TOTOYA home"><img src="assets/totoya-official-logo.webp" width="1059" height="450" alt=""></a>
  <div class="rail-copy"><p>Only at Totoya</p><p>Negitoro &amp; Japanese Seafood Bowls</p></div>
  <div class="rail-actions"><a href="locations.html#reservations">Reservations</a><a href="order.html">Order online</a></div>
  <details class="rail-menu"><summary>Menu</summary>
    <nav aria-label="Main navigation"><ul>{links}</ul></nav>
  </details>
</header>'''
    return f'''<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap header-inner">{brand()}
<button class="nav-toggle" aria-label="Open navigation menu" aria-controls="primary-nav" aria-expanded="false">Menu</button>
<nav id="primary-nav" class="primary-nav" aria-label="Main navigation"><ul class="nav-list">{links}</ul></nav></div></header>
{ANNOUNCEMENT}'''

def footer():
    links = ''.join(f'<a href="{path}">{label}</a>' for path, label in FOOTER)
    return f'''<div class="wrap social-banner"><p>A little closer to your next bowl. Follow our latest dishes and news.</p>{external(INSTAGRAM, '@totoya_hawaii')}</div>
<footer class="site-footer"><div class="wrap footer-main"><div>{brand()}<p>Japanese Negitoro &amp; Seafood Bowls<br>Kaimuki · Ala Moana / Piikoi · Aiea</p>{external(INSTAGRAM, 'Instagram')}</div>
<nav class="footer-links" aria-label="Footer navigation">{links}</nav></div>
<div class="wrap footer-bottom"><span>© <span data-year>2026</span> TOTOYA. All rights reserved.</span><span>A Funergy Group concept.</span></div></footer>
<script src="nav.js" defer></script>'''

def document(filename, title, description, content, home=False):
    canonical = 'https://www.totoyahawaii.com/' + ('' if home else filename)
    home_assets = '<link rel="stylesheet" href="home.css"><script src="home.js" defer></script>' if home else ''
    text = f'''<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#142c4e"><title>{escape(title)}</title>
<meta name="description" content="{escape(description, quote=True)}"><link rel="canonical" href="{canonical}">
<meta property="og:type" content="website"><meta property="og:title" content="{escape(title, quote=True)}"><meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="https://www.totoyahawaii.com/assets/hero-poster.jpg"><meta property="og:site_name" content="TOTOYA Hawaii">
<link rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48"><link rel="icon" type="image/png" sizes="32x32" href="assets/totoya-icon-32.png"><link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="style.css">{home_assets}
</head><body{(' class="home"' if home else '')}>{header(filename)}
<main id="main">{content}</main>{footer()}</body></html>'''
    (ROOT / filename).write_text(text, encoding='utf-8')

def page_hero(eyebrow, title, intro):
    return f'<section class="page-hero"><div class="wrap"><span class="eyebrow">{eyebrow}</span><h1>{title}</h1><p class="intro">{intro}</p></div></section>'

def locations(order=False):
    cards = []
    for s in STORES:
        tag = 'Reservations welcome' if s['reserve'] else 'Dine-in &amp; takeout'
        reserve = ''
        if s['reserve']:
            reserve = external(s['reserve'], 'Reserve Kaimuki', 'btn btn--outline') if s['id']=='kaimuki' else '<a class="btn btn--outline" href="tel:+18084876808">Call to reserve</a>'
        cards.append(f'''<article class="location" id="{s['id']}"><span class="tag">{tag}</span><h3>{s['name']}</h3><address>{s['address']}</address>
<p class="hours">Open daily<br>Lunch 11:00 AM – 2:30 PM<br>Dinner 5:00 PM – 8:30 PM</p><a class="phone" href="tel:{s['tel']}">{s['phone']}</a>
<div class="btn-row">{external(s['order'], 'Order takeout', 'btn')}{reserve}</div>
{external('https://maps.google.com/?q='+quote_plus(s['address']), 'Get directions')}</article>''')
    return '<div class="locations-grid">'+''.join(cards)+'</div>'

def kapolei():
    return '''<div class="new-location"><div><span class="eyebrow">Our next chapter</span><h3>See you soon, Kapolei.</h3></div><div><p>Our Kapolei location is planned to open in late February. Stay tuned for the opening date, address, and more details.</p><a class="text-link" href="news.html#kapolei">Opening updates</a></div></div>'''

def reservation_band():
    return f'''<section class="reservation-band" id="reservations"><div class="wrap reservation-inner"><div><span class="eyebrow">Stay a little. Enjoy a bowl.</span><h2>A seat at TOTOYA.</h2><p>Reservations are now welcome at Kaimuki and Aiea. Book Kaimuki online, or call our Aiea team to arrange your visit.</p></div><div class="btn-row">{external(KAIMUKI_RESERVE, 'Reserve Kaimuki', 'btn btn--light')}<a class="btn btn--light" href="tel:+18084876808">Call Aiea to reserve</a></div></div></section>'''

home = '''<section class="home-hero" aria-labelledby="hero-title">
  <div class="home-slides">
    <img class="is-current" src="assets/tokujo-meal-hero.webp" width="1536" height="1024" fetchpriority="high" alt="Tokujo negitoro bowl with snow crab, uni and salmon roe, served with miso soup">
    <img src="assets/negitoro-yolk-pour.webp" width="1171" height="1640" loading="lazy" alt="Egg yolk sauce being poured over a Tokujo bowl" aria-hidden="true">
    <img src="assets/negitoro-counter.webp" width="1303" height="1640" loading="lazy" alt="Negitoro bowls served at the Totoya counter" aria-hidden="true">
  </div>
  <div class="home-hero-brand">
    <img class="hero-vertical-logo" src="assets/totoya-vertical-logo.webp" width="835" height="1883" fetchpriority="high" alt="Totoya">
    <h1 id="hero-title">Negitoro Bowl.<span>The Totoya taste you’ll come back for.</span></h1>
  </div>
  <div class="home-hero-foot">
    <div class="home-caption"><p>TOTOYA · O‘ahu, Hawai‘i</p><p>Japanese Negitoro &amp; Seafood Bowls</p><a href="menu.html">Explore our menu</a></div>
    <div class="slide-controls" role="group" aria-label="Hero photographs" hidden>
      <button type="button" aria-label="Show the Tokujo meal" aria-pressed="true"></button>
      <button type="button" aria-label="Show egg yolk sauce on a Tokujo bowl" aria-pressed="false"></button>
      <button type="button" aria-label="Show negitoro at the counter" aria-pressed="false"></button>
      <button type="button" class="slide-playback">Pause slideshow</button>
    </div>
  </div>
</section>''' + ANNOUNCEMENT
home += '''
<section class="section sea-section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">Meet your next favorite</span><h2>Seafood, at the center.</h2></div><p class="intro">From our signature negitoro bowls to a hand-roll night at home, there’s more than one way to enjoy TOTOYA.</p></div><div class="food-grid">
<article class="food-card"><img src="assets/kaisendon-ikura.jpg" width="720" height="1280" alt="TOTOYA negitoro seafood bowl topped with salmon roe" loading="lazy"><h3>Signature bowls</h3><p>Original negitoro, with your choice of salmon roe, uni, or snow crab.</p><span class="card-label">Ume · Take · Matsu · Tokujo</span></article>
<article class="food-card"><img src="assets/sashimi-bowl.jpg" width="720" height="1280" alt="A TOTOYA bowl with sliced seafood" loading="lazy"><h3>Sashimi favorites</h3><p>Explore our sashimi bowls and find your own favorite combination.</p><span class="card-label">See each location’s menu</span></article>
<article class="food-card"><img src="assets/handroll.jpg" width="540" height="720" alt="TOTOYA takeout hand-roll set with seafood and ingredients" loading="lazy"><h3>Hand-roll set</h3><p>Make it a hand-roll night. A set for 2–3, with 600g of sushi rice and 20 nori sheets.</p><span class="card-label">Kaimuki only · Takeout</span></article>
</div><div class="btn-row"><a class="btn btn--outline" href="menu.html">Discover the menu</a></div></div></section>
<section class="section"><div class="wrap experience"><img src="assets/kaisendon-uni.jpg" width="720" height="1280" alt="TOTOYA seafood bowl with uni and salmon roe" loading="lazy"><div class="experience-copy"><span class="eyebrow">The TOTOYA way</span><h2>A little Japan.<br>Right here in Hawai‘i.</h2><p class="kicker" lang="ja">海の恵みを、一杯に。</p><p class="intro">Kaisendon brings seafood and rice together in one satisfying bowl. At TOTOYA, enjoy it with us or take your favorites home.</p><div class="steps"><div class="step"><strong>Your bowl</strong><p>Start with our original negitoro or explore the sashimi selection.</p></div><div class="step"><strong>Your toppings</strong><p>Discover salmon roe, uni, snow crab, and more on the menu.</p></div><div class="step"><strong>Your moment</strong><p>A lunch break, an evening together, or a bowl to take home.</p></div></div><a class="text-link" href="about.html">Get to know TOTOYA</a></div></div></section>'''
home += '''<section class="home-film wrap" aria-labelledby="film-heading"><div><h2 id="film-heading">A taste of Japan.<br>A bowl of aloha.</h2><p class="intro">Beautiful seafood. A generous bowl. Find your favorite kaisendon at TOTOYA.</p><div class="btn-row"><a class="btn" href="menu.html">Explore the menu</a><a class="btn btn--outline" href="locations.html#reservations">Reserve a table</a></div></div>
<div class="home-film-media"><video id="brand-film" data-src="assets/hero-loop.mp4" poster="assets/hero-poster.jpg" muted loop playsinline preload="none" aria-label="TOTOYA seafood bowls and restaurant brand film"></video><button id="film-control" class="film-control" type="button" hidden>Play film</button></div></section>'''
home += reservation_band()
home += '<section class="section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">Find your TOTOYA</span><h2>Three neighborhoods.<br>One love of seafood.</h2></div><p class="intro">Visit us in Kaimuki, Ala Moana / Piikoi, or Aiea. Kapolei is coming next.</p></div>'+locations()+kapolei()+'</div></section>'
home += f'''<section class="section sea-section"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">From TOTOYA</span><h2>Fresh from the feed.</h2></div><a class="text-link" href="news.html">All news</a></div><div class="news-grid"><article class="news-card"><time datetime="2026-11-17">NOVEMBER 17, 2026</time><h3>Hand-roll night, made easy.</h3><p>Our Hand-roll Set brings a little TOTOYA to your table. Available for takeout at Kaimuki.</p>{external(HANDROLL_POST, 'View the Instagram post')}</article><article class="news-card"><time datetime="2026-10-28">OCTOBER 28, 2026</time><h3>Reservations are welcome.</h3><p>Plan your next visit to our Kaimuki or Aiea location. We look forward to seeing you.</p><a class="text-link" href="locations.html#reservations">Plan your visit</a></article></div></div></section>'''
document('index.html', 'TOTOYA — Japanese Negitoro & Seafood Bowls', 'TOTOYA — Japanese Negitoro & Seafood Bowls in Kaimuki, Ala Moana / Piikoi and Aiea. Reserve Kaimuki or Aiea, order takeout, and explore our hand-roll set. Kapolei opens late February.', home, True)

menu_rows = ''.join(f'<div class="menu-item"><h3>{name}</h3><span class="price">${price}</span><p>{desc}</p></div>' for name,price,desc in [
('Ume 梅','18.90','Our original negitoro bowl.'),
('Take 竹','26.90','Original negitoro topped with salmon roe.'),
('Matsu 松','34.90','Original negitoro with salmon roe and uni.'),
('Tokujo 特上','38.90','Original negitoro with salmon roe, uni, and snow crab.')])
menu = page_hero('The menu', 'Find your favorite bowl.', 'Signature kaisendon, sashimi favorites, and a hand-roll set to share at home. Explore the highlights, then choose your location for the full menu.')
menu += f'''<section class="page-body"><div class="wrap"><div class="menu-intro"><img src="assets/kaisendon-ikura.jpg" width="720" height="1280" alt="Negitoro seafood bowl with salmon roe" loading="eager"><div><span class="eyebrow">Signature kaisendon · Takeout prices</span><h2>Start with a classic.</h2><div class="menu-list">{menu_rows}</div><p class="note">Prices shown are for takeout. Dine-in offerings and prices may differ. Check your location’s live menu for availability and current pricing.</p><div class="btn-row"><a class="btn" href="order.html">Choose a location &amp; order</a></div></div></div>
<div class="feature-block"><span class="tag">Kaimuki exclusive · Takeout only</span><div class="menu-intro" style="margin-bottom:0"><div><span class="eyebrow">Make it a hand-roll night</span><h2>TOTOYA Hand-roll Set</h2><p><strong>$75 · Serves 2–3</strong></p><p>Make your own hand rolls with seafood, sushi rice, and nori, ready to share around your table.</p><ul class="menu-details"><li>600g of sushi rice and 20 nori sheets</li><li>Original negitoro, tuna, salmon, and scallop sashimi</li><li>House-marinated shoyu tuna poke, snow crab, salmon roe, tobiko, mentaiko, and cucumber</li></ul><div class="btn-row">{external(STORES[0]['order'], 'Order from Kaimuki', 'btn')}</div>{external(HANDROLL_POST, 'See the hand-roll set on Instagram')}</div><img src="assets/handroll.jpg" width="540" height="720" alt="TOTOYA Hand-roll Set for takeout from Kaimuki" loading="lazy"></div></div>
<div class="section-heading" style="margin-top:70px"><div><span class="eyebrow">More to discover</span><h2>Make it your own.</h2></div><p class="intro">Find sashimi bowls, extra toppings, and sides on each location’s menu. The live ordering page has the full takeout selection.</p></div><div class="food-grid"><article class="food-card"><img src="assets/sashimi-bowl.jpg" width="720" height="1280" alt="TOTOYA sashimi seafood bowl" loading="lazy"><h3>Sashimi bowls</h3><p>A selection of seafood combinations, including salmon and tuna favorites.</p></article><article class="food-card"><img src="assets/kaisendon-uni.jpg" width="720" height="1280" alt="Uni and salmon roe on a TOTOYA bowl" loading="lazy"><h3>Something extra</h3><p>Explore toppings such as uni and salmon roe on the live menu.</p></article><article class="food-card"><img src="assets/kaisendon-spoon.jpg" width="720" height="1280" alt="A spoonful of TOTOYA seafood and rice" loading="lazy"><h3>Enjoy it your way</h3><p>Choose a bowl for lunch, dinner, or takeout. We’ll see you at TOTOYA.</p></article></div><div class="btn-row"><a class="btn" href="order.html">View full takeout menus</a><a class="btn btn--outline" href="locations.html#reservations">Reserve a table</a></div></div></section>'''
document('menu.html', 'TOTOYA Menu — Kaisendon, Seafood Bowls & Hand-roll Set', 'Explore TOTOYA Ume, Take, Matsu and Tokujo seafood bowls and the Kaimuki-exclusive $75 Hand-roll Set for 2–3. View current takeout menus.', menu)

loc = page_hero('Visit TOTOYA', 'A good bowl is close by.', 'Find our three locations across O‘ahu. Reservations are now available at Kaimuki and Aiea, and takeout is available from all three shops.')
loc += '<section class="page-body"><div class="wrap">'+locations()+kapolei()+'</div></section>'+reservation_band()
document('locations.html', 'TOTOYA Locations & Reservations — Kaimuki, Piikoi & Aiea', 'Hours, addresses, directions, and takeout for TOTOYA Kaimuki, Ala Moana / Piikoi, and Aiea. Reserve Kaimuki online or call Aiea. Kapolei planned for late February.', loc)

order = page_hero('TOTOYA to go', 'Your favorite bowl.<br>On your time.', 'Order online, then pick up at your chosen TOTOYA. Select a location to see its full takeout menu and available pickup times.')
order += '<section class="page-body"><div class="wrap"><div class="notice"><p><strong>Ordering for pickup?</strong> These links open our takeout menus. For a table at Kaimuki or Aiea, please visit <a href="locations.html#reservations">Reservations</a>.</p></div>'+locations()+'<div class="feature-block"><span class="tag">Kaimuki only</span><h2>A hand-roll night at home.</h2><p>The $75 TOTOYA Hand-roll Set serves 2–3, with 600g of sushi rice, 20 nori sheets, and seafood to roll your way. Available for takeout from Kaimuki.</p><a class="text-link" href="menu.html">Explore the hand-roll set</a></div></div></section>'
document('order.html', 'Order TOTOYA Takeout — Kaimuki, Piikoi & Aiea', 'Order TOTOYA seafood bowls online for pickup in Kaimuki, Ala Moana / Piikoi, or Aiea. Hand-roll Sets are available at Kaimuki only.', order)

about = page_hero('Our story', 'Japanese at heart.<br>At home in Hawai‘i.', 'TOTOYA brings Japanese seafood bowls to the neighborhoods of O‘ahu. A place to pause, share a meal, and enjoy what’s in your bowl.')
about += '''<section class="page-body"><div class="wrap story-grid"><img src="assets/totoya-lantern.jpg" width="720" height="1280" alt="The TOTOYA restaurant lantern" loading="eager"><div class="prose"><span class="eyebrow">魚屋 · TOTOYA</span><h2>Seafood is our starting point.</h2><p>Our name means “fish shop.” Our menu brings seafood together with rice in kaisendon: a Japanese bowl made for enjoying one bite at a time.</p><h2>A bowl for your moment.</h2><p>From original negitoro to salmon roe, uni, and snow crab, our menu offers plenty to explore. Meet over lunch, settle in for dinner, or pick up a favorite to enjoy at home.</p><h2>Part of your neighborhood.</h2><p>Visit us in Kaimuki, Ala Moana / Piikoi, and Aiea. We are also preparing to welcome the Kapolei community, with an opening planned for late February.</p><div class="btn-row"><a class="btn" href="locations.html">Find your TOTOYA</a><a class="btn btn--outline" href="menu.html">Explore the menu</a></div></div></div></section>'''
document('about.html', 'About TOTOYA — Japanese Negitoro & Seafood Bowls', 'TOTOYA — Japanese Negitoro & Seafood Bowls. A Funergy Group concept in Kaimuki, Piikoi, Aiea, and soon Kapolei.', about)

craft = page_hero('The bowl', 'Simple pleasures.<br>Beautiful ingredients.', 'Seafood, rice, and the little choices that make a bowl your own. Get to know the flavors at the heart of TOTOYA.')
craft += '''<section class="page-body"><div class="wrap story-grid"><div class="prose"><span class="eyebrow">A closer look</span><h2>Original negitoro</h2><p>Our signature bowl starts with original negitoro. Choose Ume for the original, or explore the combinations in Take, Matsu, and Tokujo.</p><h2>A world of toppings</h2><p>Salmon roe, uni, and snow crab each bring something different to the bowl. Find a combination you love, then explore more on your next visit.</p><h2>Beyond the signature</h2><p>Our sashimi selection offers another way to enjoy seafood over rice. For a shared meal at home, the Kaimuki Hand-roll Set brings seafood, sushi rice, and nori together for 2–3 people.</p><div class="btn-row"><a class="btn" href="menu.html">Explore the menu</a><a class="btn btn--outline" href="order.html">Order takeout</a></div></div><img src="assets/kaisendon-counter.jpg" width="720" height="1280" alt="TOTOYA seafood bowls at the counter" loading="eager"></div></section>'''
document('craft.html', 'The TOTOYA Bowl — Negitoro, Sashimi & Seafood', 'Discover the ingredients in TOTOYA seafood bowls, from original negitoro to salmon roe, uni, and snow crab.', craft)

news = page_hero('From TOTOYA', 'Good things to share.', 'Menu highlights, neighborhood news, and the latest from TOTOYA. Follow our Instagram for more from the kitchen and our shops.')
news += f'''<section class="page-body"><div class="wrap news-list"><article class="news-card" id="kapolei"><span class="eyebrow">Coming soon</span><h2>Kapolei, we’re on our way.</h2><p>Our Kapolei location is planned to open in late February. We look forward to bringing TOTOYA to another O‘ahu neighborhood.</p><p>The opening date, address, and further details will be announced. Follow us for updates.</p>{external(INSTAGRAM, 'Follow TOTOYA on Instagram')}</article>
<article class="news-card" id="handroll"><time datetime="2026-11-17">NOVEMBER 17, 2026</time><h2>Make it a TOTOYA hand-roll night.</h2><p>Our Hand-roll Set is available exclusively at Kaimuki for takeout. The $75 set serves 2–3, with 600g of sushi rice, 20 nori sheets, and seafood for rolling at home.</p><div class="inline-actions">{external(HANDROLL_POST, 'View the Instagram post')}<a class="text-link" href="menu.html">Explore the set</a></div></article>
<article class="news-card" id="reservation-news"><time datetime="2026-10-28">OCTOBER 28, 2026</time><h2>Reservations at Kaimuki and Aiea.</h2><p>Planning lunch or dinner with us? We now welcome reservations at Kaimuki and Aiea. Book Kaimuki online, or call Aiea to arrange your visit.</p><div class="inline-actions"><a class="text-link" href="locations.html#reservations">Reserve your table</a>{external(RESERVATION_POST, 'View the Instagram announcement')}</div></article></div></section>'''
document('news.html', 'TOTOYA News — Kapolei Opening, Hand-roll Set & Reservations', 'TOTOYA Kapolei is planned to open in late February. Discover our Kaimuki Hand-roll Set and reservations at Kaimuki and Aiea.', news)

recruit = page_hero('Join the team', 'Bring your aloha.', 'Interested in working with TOTOYA? We’d love to hear from people who enjoy good food and taking care of guests.')
recruit += '''<section class="page-body"><div class="wrap story-grid"><img src="assets/totoya-lantern.jpg" width="720" height="1280" alt="TOTOYA lantern at the restaurant" loading="eager"><div class="prose"><span class="eyebrow">Let’s connect</span><h2>Start a conversation.</h2><p>Contact a TOTOYA location to ask about current opportunities and how to apply. Our team can point you in the right direction.</p><div class="btn-row"><a class="btn" href="tel:+18086005017">Call Kaimuki</a><a class="btn btn--outline" href="locations.html">All locations</a></div><h2>Growing on O‘ahu.</h2><p>With Kaimuki, Ala Moana / Piikoi, and Aiea, plus Kapolei on the way, there’s more ahead for TOTOYA.</p><a class="text-link" href="news.html#kapolei">Read the Kapolei update</a></div></div></section>'''
document('recruit.html', 'Join the TOTOYA Team — Hawai‘i Restaurant Opportunities', 'Contact TOTOYA in Kaimuki, Piikoi, or Aiea to ask about current restaurant opportunities and how to apply.', recruit)
print('Rendered 8 static TOTOYA pages.')
