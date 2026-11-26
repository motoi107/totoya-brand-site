"""Customer-facing editorial sections of the TOTOYA Kamata design."""
from html import escape

from site_assets import asset_url


BOWLS = (
    ('ume', 'Ume negitoro bowl'),
    ('take', 'Take negitoro bowl'),
    ('matsu', 'Matsu negitoro bowl'),
    ('tokujo', 'Tokujo negitoro bowl'),
    ('nagomi', 'Nagomi seafood bowl'),
    ('miyabi', 'Miyabi seafood bowl'),
    ('nishiki', 'Nishiki seafood bowl'),
    ('fukuju', 'Fukuju seafood bowl'),
    ('salmon', 'Salmon Bowl'),
    ('rainbow-trio', 'Rainbow Trio bowl'),
    ('maguro-lover', 'Maguro Lover bowl'),
)

SIGNATURES = (
    ('ume', 'Ume', 'Negitoro + tobiko', '$21.90', 'Ume negitoro bowl with tobiko'),
    ('take', 'Take', 'With salmon roe', '$28.90', 'Take negitoro bowl with salmon roe'),
    ('matsu', 'Matsu', 'With salmon roe + uni', '$37.90', 'Matsu negitoro bowl with sea urchin'),
    ('tokujo', 'Tokujo', 'With salmon roe + crab + uni', '$41.90', 'Tokujo negitoro bowl with snow crab and sea urchin'),
)

INSTAGRAM = 'https://www.instagram.com/totoya_hawaii/'
STORY_SCENES = (
    ('The craft', 'Made by hand.', 'Prepared fresh each day. Finished one bowl at a time.',
     'The team adds finishing touches to TOTOYA negitoro bowls',
     asset_url('/assets/film-craft.mp4'), asset_url('/assets/story-craft.webp')),
    ('The finish', 'The finishing touch.', 'A cascade of ikura. A bright, briny pop.',
     'Salmon roe cascading onto a TOTOYA negitoro bowl',
     asset_url('/assets/film-ikura.mp4'), asset_url('/assets/story-ikura.webp')),
    ('The first bite', 'That first bite.', 'Rich, fresh and full of texture.',
     'A spoonful of TOTOYA negitoro above a seafood bowl',
     asset_url('/assets/film-bite.mp4'), asset_url('/assets/story-bite.webp')),
)

ORDER_LINKS = (
    ('Kaimuki', 'https://order.toasttab.com/online/totoya-hawaii'),
    ('Ala Moana / Piikoi', 'https://order.toasttab.com/online/totoya-ala-moana-436-piikoi-st-suite-b'),
    ('Aiea', 'https://order.toasttab.com/online/totoya-aiea-nro-99-115-aiea-heights-drive-unit-250'),
)


def intro():
    bowls = ''.join(
        f'<li><img src="/assets/bowl-{slug}.webp" loading="lazy" alt="{name}"></li>'
        for slug, name in BOWLS
    )
    return f'''<section class="ed-section ed-intro" id="intro" aria-labelledby="intro-title">
  <p class="mobile-only mobile-section-title">About</p>
  <p class="ed-kicker">Our original negitoro</p>
  <div class="ed-composition"><div class="ed-intro-copy">
    <h2 id="intro-title">Only at Totoya.<br>Made fresh, every day.</h2>
    <p>A one-of-a-kind negitoro, made our way.</p>
    <p>We prepare our original negitoro fresh each day, to be enjoyed that very day—at its freshest.</p>
    <p>Tuna, scallops, cucumber and herring roe.<br>Our signature blend of rich flavor and delicate crunch.<br>A taste you’ll find only at Totoya.</p>
  </div><ul class="ed-bowls" aria-label="Eleven Totoya bowls">{bowls}</ul></div>
  <div class="mobile-only mobile-about-strip" aria-hidden="true"><div class="mobile-photo-track">
    <img src="/assets/story-craft.webp" width="1080" height="1920" loading="lazy" alt=""><img src="/assets/negitoro-counter.webp" width="1303" height="1640" loading="lazy" alt=""><img src="/assets/story-bite.webp" width="1080" height="1920" loading="lazy" alt="">
    <img src="/assets/story-craft.webp" width="1080" height="1920" loading="lazy" alt=""><img src="/assets/negitoro-counter.webp" width="1303" height="1640" loading="lazy" alt=""><img src="/assets/story-bite.webp" width="1080" height="1920" loading="lazy" alt="">
  </div></div>
</section>'''


def news():
    return '''<section class="ed-section ed-news" id="news" aria-labelledby="news-title">
  <h2 id="news-title"><span class="desktop-only">News</span><span class="mobile-only">Information</span></h2>
  <ul>
    <li><span class="ed-kicker">Coming soon</span><p>Kapolei — opening planned for late February.</p></li>
    <li><span class="ed-kicker">Reservations</span><p>We’re taking reservations at <a href="https://toast.app/r/totoya-hawaii">Kaimuki</a> and <a href="https://www.google.com/maps/reserve/v/dine/c/HFvPblyZHtM">Aiea</a>.</p></li>
    <li><span class="ed-kicker">Our menu</span><p>Explore our menu, available at all three locations. <a href="/#menu">View menu</a></p></li>
  </ul>
</section>'''


def signatures():
    categories = (
        ('bowl-tokujo.webp', 'Signature Negitoro Bowls', 'Our specialty'),
        ('bowl-fukuju.webp', 'Sashimi & Seafood Bowls', 'More TOTOYA favorites'),
        ('tokujo-meal-hero.webp', 'Complete your meal', 'Miso Soup & Udon'),
        ('totoya-at-home-closeup-768.webp', 'Order online', 'Your favorite bowl, to go'),
    )
    mobile_cards = ''.join(f'''<a class="mobile-menu-card" href="/menu.html" data-mobile-menu="{index}" aria-haspopup="dialog"><img src="/assets/{photo}" loading="lazy" alt=""><div class="mobile-card-copy"><span class="mobile-card-title">{escape(title)}</span><span class="mobile-card-subtitle">{subtitle}</span><span class="mobile-card-open" aria-hidden="true">＋</span></div></a>''' for index, (photo, title, subtitle) in enumerate(categories))
    mobile_cards = mobile_cards.replace('href="/menu.html" data-mobile-menu="3"', 'href="/order.html" data-booking="order"')
    cards = []
    for slug, name, detail, price, alt in SIGNATURES:
        cards.append(f'''<a class="ed-signature" href="/#menu"><figure>
  <div class="ed-dish-photo"><img src="/assets/bowl-{slug}.webp" loading="lazy" alt="{alt}"></div>
  <figcaption><div><h3>{name}</h3><p>{detail}</p></div><span>{price}</span></figcaption>
</figure></a>''')
    return f'''<section class="ed-section ed-signatures" id="gallery" aria-labelledby="signatures-title">
  <div class="ed-heading">
    <p class="mobile-only mobile-section-title">Menu</p>
    <h2 id="signatures-title" class="ed-signature-title">
      <span class="ed-signature-lead">Our signature</span>
      <span class="ed-signature-name">Negitoro</span>
    </h2>
    <p>It starts with negitoro.<br>Make it yours with the toppings you love.</p>
  </div><div class="mobile-only mobile-menu-cards">{mobile_cards}</div><div class="ed-signature-grid">{''.join(cards)}</div>
</section>'''


def film(scene):
    name, _, _, label, clip, poster = scene
    return f'''<div class="ed-reel-media">
  <img src="{poster}" loading="lazy" width="1080" height="1920" alt="{escape(label, quote=True)}">
  <video autoplay loop muted playsinline preload="none" disablepictureinpicture aria-hidden="true" tabindex="-1"
         data-src="{clip}"></video>
</div>
<button type="button" class="ed-reel-toggle" data-film-name="{name}" hidden>Pause</button>'''


def story():
    links = (None, (INSTAGRAM + 'reels/', 'Discover our Instagram reels'), ('/#shopinfo', 'Find your Totoya'))
    chapters = []
    for number, (scene, link) in enumerate(zip(STORY_SCENES, links), start=1):
        _, title, description = scene[:3]
        action = f'<a class="ed-story-link" href="{link[0]}">{link[1]}</a>' if link else ''
        chapters.append(f'''<figure class="ed-story-scene" id="story-scene-{number}" data-reel>
      {film(scene)}
      <figcaption><h3>{title}</h3><p>{description}</p>{action}</figcaption>
    </figure>''')
    return f'''<section class="ed-section ed-story" id="history" aria-labelledby="story-title">
  <h2 id="story-title" class="ed-story-heading"><span id="moments-title">Our story</span></h2>
  <div class="mobile-only mobile-shop-photo"><img src="/assets/negitoro-counter.webp" width="1303" height="1640" loading="lazy" alt="Negitoro bowls served at the TOTOYA counter"></div>
  <div class="ed-story-grid" id="moments">{''.join(chapters)}</div>
</section>'''


def takeaway():
    links = ''.join(
        f'<li><a href="{url}" id="pickup-shop-{i}" aria-labelledby="pickup-heading pickup-shop-{i}">{label}</a></li>'
        for i, (label, url) in enumerate(ORDER_LINKS, start=1)
    )
    return f'''<section class="ed-section ed-takeaway" id="onlinestore" aria-labelledby="order-title">
  <div class="ed-order-image"><img src="/assets/totoya-at-home-closeup-768.webp"
    srcset="/assets/totoya-at-home-closeup-480.webp 480w, /assets/totoya-at-home-closeup-768.webp 768w"
    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1150px) calc(50vw - 92px), min(calc(50vw - 110px), 768px)"
    width="768" height="576" loading="lazy" decoding="async"
    alt="A Tokujo takeout bowl with negitoro, sea urchin, snow crab and salmon roe on the wooden TOTOYA counter"></div>
  <div class="ed-order-copy"><p class="ed-kicker">Your favorite bowl, to go</p><h2 id="order-title">Totoya at home.</h2>
    <p>Our original negitoro, wherever you feel at home.</p>
    <p class="ed-order-prompt" id="pickup-heading">Order for pickup</p>
    <ul class="ed-order-links" aria-labelledby="pickup-heading">{links}</ul>
  </div>
</section>'''
