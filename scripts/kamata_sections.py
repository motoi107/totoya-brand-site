"""Customer-facing editorial sections of the TOTOYA Kamata design."""
from html import escape


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
    ('The craft', 'Made by hand.', 'Finishing touches, one bowl at a time.',
     'The team adds finishing touches to TOTOYA negitoro bowls',
     '/assets/hero-loop.mp4#t=8.95,11.7', '/assets/story-craft.webp'),
    ('The finish', 'The finishing touch.', 'A cascade of ikura. A bright, briny pop.',
     'Salmon roe cascading onto a TOTOYA negitoro bowl',
     '/assets/hero-loop.mp4#t=0.4,4.55', '/assets/story-ikura.webp'),
    ('The first bite', 'That first bite.', 'Rich, fresh and full of texture.',
     'A spoonful of TOTOYA negitoro above a seafood bowl',
     '/assets/hero-loop.mp4#t=20.48,22.2', '/assets/story-bite.webp'),
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
  <p class="ed-kicker">Our original negitoro</p>
  <div class="ed-composition"><div class="ed-intro-copy">
    <h2 id="intro-title">Only at Totoya.<br>Made fresh, every day.</h2>
    <p>A one-of-a-kind negitoro, made our way.</p>
    <p>We prepare our original negitoro fresh each day, to be enjoyed that very day—at its freshest.</p>
    <p>Tuna, scallops, cucumber and herring roe.<br>Our signature blend of rich flavor and delicate crunch.<br>A taste you’ll find only at Totoya.</p>
  </div><ul class="ed-bowls" aria-label="Eleven Totoya bowls">{bowls}</ul></div>
</section>'''


def news():
    return '''<section class="ed-section ed-news" id="news" aria-labelledby="news-title">
  <h2 id="news-title">News</h2>
  <ul>
    <li><span class="ed-kicker">Coming soon</span><p>Kapolei — opening planned for late February.</p></li>
    <li><span class="ed-kicker">Reservations</span><p>We’re taking reservations at <a href="https://toast.app/r/totoya-hawaii">Kaimuki</a> and <a href="https://www.google.com/maps/reserve/v/dine/c/HFvPblyZHtM">Aiea</a>.</p></li>
    <li><span class="ed-kicker">Our menu</span><p>Explore our menu, available at all three locations. <a href="/#menu">View menu</a></p></li>
  </ul>
</section>'''


def signatures():
    cards = []
    for slug, name, detail, price, alt in SIGNATURES:
        cards.append(f'''<a class="ed-signature" href="/#menu"><figure>
  <div class="ed-dish-photo"><img src="/assets/bowl-{slug}.webp" loading="lazy" alt="{alt}"></div>
  <figcaption><div><h3>{name}</h3><p>{detail}</p></div><span>{price}</span></figcaption>
</figure></a>''')
    return f'''<section class="ed-section ed-signatures" id="gallery" aria-labelledby="signatures-title">
  <div class="ed-heading"><p class="ed-kicker">The heart of Totoya</p>
    <h2 id="signatures-title">Our signature bowls</h2>
    <p>It starts with negitoro.<br>Make it yours with the toppings you love.</p>
  </div><div class="ed-signature-grid">{''.join(cards)}</div>
</section>'''


def film(scene):
    _, _, _, label, media, poster = scene
    return f'''<video controls playsinline muted preload="none" poster="{poster}" aria-label="{escape(label, quote=True)}">
  <source src="{media}" type="video/mp4">
  <a href="{media}">Play film</a>
</video>'''


def story():
    panels = []
    buttons = []
    for i, scene in enumerate(STORY_SCENES):
        name, title, description = scene[:3]
        hidden = ' hidden' if i else ''
        pressed = 'true' if i == 0 else 'false'
        panels.append(f'''<figure class="ed-scene" id="story-scene-{i+1}"{hidden}>
  <div class="ed-story-screen">{film(scene)}</div>
  <figcaption><span class="ed-scene-meta">{i+1} / 3 <span>Moments at TOTOYA</span></span>
    <h3>{title}</h3><p>{description}</p>
  </figcaption>
</figure>''')
        buttons.append(f'<button type="button" aria-pressed="{pressed}" aria-controls="story-scene-{i+1}">{name}</button>')
    return f'''<section class="ed-section ed-story" id="history" aria-labelledby="story-title">
  <div class="ed-story-heading"><p class="ed-kicker">Our story</p><h2 id="story-title">Made with care.</h2>
    <p>Prepared fresh each day. Finished one bowl at a time.<br>Take a closer look at the care behind our original negitoro.</p>
    <a class="ed-link" href="{INSTAGRAM}">More moments on Instagram</a>
  </div>
  <div class="ed-story-player"><div aria-live="polite">{''.join(panels)}</div>
    <div class="ed-scene-chooser" aria-label="Choose a scene" role="group" hidden>{''.join(buttons)}</div>
    <div class="ed-scene-step" hidden><button type="button" data-step="-1">Previous</button><button type="button" data-step="1">Next</button></div>
  </div>
</section>'''


def moments():
    return f'''<section class="ed-section ed-moments" id="moments" aria-labelledby="moments-title">
  <div class="ed-heading"><p class="ed-kicker">Moments at Totoya</p><h2 id="moments-title">More than a bowl.</h2>
    <p>The finishing touch. The first bite.<br>A few little moments worth savoring.</p>
  </div>
  <div class="ed-moments-grid">
    <article><div class="ed-moment-screen">{film(STORY_SCENES[1])}</div><h3>The finishing touch.</h3>
      <p>A cascade of ikura. A bright, briny pop. Watch a favorite topping bring our original negitoro to life.</p>
      <a class="ed-link" href="{INSTAGRAM}reels/">Discover our Instagram reels</a>
    </article>
    <article><div class="ed-moment-screen">{film(STORY_SCENES[2])}</div><h3>That first bite.</h3>
      <p>Rich, fresh and full of texture. Pull up a seat and discover the taste that makes Totoya our own.</p>
      <a class="ed-link" href="/#shopinfo">Find your Totoya</a>
    </article>
  </div>
  <p class="ed-social">Follow <a href="{INSTAGRAM}">@totoya_hawaii</a> for more from our kitchen.</p>
</section>'''


def takeaway():
    links = ''.join(f'<li><a href="{url}">{label}</a></li>' for label, url in ORDER_LINKS)
    return f'''<section class="ed-section ed-takeaway" id="onlinestore" aria-labelledby="order-title">
  <div class="ed-order-image"><img src="/assets/menu-tokujo.jpg" loading="lazy" alt="Tokujo negitoro with sea urchin, snow crab and salmon roe in TOTOYA’s takeout container"></div>
  <div class="ed-order-copy"><p class="ed-kicker">Your favorite bowl, to go</p><h2 id="order-title">Totoya at home.</h2>
    <p>Our original negitoro, wherever you feel at home.<br>Choose your nearest location and order for pickup.</p>
    <ul class="ed-order-links" aria-label="Order takeout">{links}</ul>
  </div>
</section>'''
