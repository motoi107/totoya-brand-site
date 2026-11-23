"""Dine-in menu and visitor information used by the index and dedicated pages."""
from html import escape
from urllib.parse import urlencode

MENU = [
    ('Signature Negitoro Bowls', 'Our specialty', [
        ('Ume', 'Negitoro + tobiko.', '$21.90'),
        ('Take', 'Negitoro + salmon roe.', '$28.90'),
        ('Matsu', 'Negitoro + salmon roe and sea urchin.', '$37.90'),
        ('Tokujo', 'Negitoro + salmon roe, snow crab and sea urchin.', '$41.90'),
    ]),
    ('Sashimi & Seafood Bowls', 'More TOTOYA favorites', [
        ('Nagomi', 'Negitoro, salmon (2 pieces), shrimp, scallops and tobiko.', '$25.90'),
        ('Miyabi', 'Negitoro, tuna (2 pieces), shrimp, scallops and salmon roe.', '$31.90'),
        ('Nishiki', 'Negitoro, tuna, salmon, shrimp, scallops, snow crab and salmon roe.', '$36.50'),
        ('Fukuju', 'Negitoro, tuna, salmon, shrimp, scallops, snow crab, sea urchin and salmon roe.', '$42.50'),
        ('Salmon Bowl', 'Salmon, salmon roe, tobiko and cucumber.', '$21.90'),
        ('Rainbow Trio', 'Salmon, scallops, salmon roe, tobiko and cucumber.', '$29.90'),
        ('Maguro Lover', 'Tuna, negitoro, green onion and egg yolk.', '$33.90'),
    ]),
    ('Miso Soup & Udon', 'Complete your meal', [
        ('Aosa Seaweed Miso Soup', 'Included with your bowl.', '+$0.00'),
        ('Today’s Miso Soup', 'Ask about today’s selection.', '+$2.90'),
        ('Crab Miso Soup', '', '+$4.90'),
        ('Half Size Udon Noodles', 'Regular price $6.50.', '+$4.90'),
    ]),
    ('Toppings', 'Make it your own', [
        ('Salmon Roe', '30 g.', '+$9.90'), ('Sea Urchin', '15 g.', '+$11.50'),
        ('Snow Crab', '15 g.', '+$8.90'), ('Nori', '4 pieces.', '+$1.50'),
        ('Egg Yolk Soy Sauce', '', '+$1.50'),
    ]),
    ('Salad & Drinks', 'On the side', [
        ('House Salad', 'Regular price $4.50.', '+$2.90'), ('Hot Green Tea', '', '+$1.50'),
        ('Iced Green Tea', '', '+$2.00'), ('Coke / Diet', '', '+$2.50'),
    ]),
]
STORES = [
    dict(id='kaimuki', name='Kaimuki', tab='Kaimuki', street='1127 12th Ave', city='Honolulu, HI 96816',
         coords=(21.281737, -157.799182), phone='(808) 600-5017', tel='+18086005017', drive='20–35 minutes',
         place='https://maps.app.goo.gl/ytFYtxSXhNfaw7ar9', reserve='https://toast.app/r/totoya-hawaii',
         order='https://order.toasttab.com/online/totoya-hawaii'),
    dict(id='piikoi', name='Ala Moana / Piikoi', tab='Piikoi', street='436 Piikoi Street B', city='Honolulu, HI 96814',
         coords=(21.293486, -157.846898), phone='(808) 260-4492', tel='+18082604492', drive='20–30 minutes',
         place='https://maps.app.goo.gl/G2F14NHWvr6UU4Pr6', reserve=None,
         order='https://order.toasttab.com/online/totoya-ala-moana-436-piikoi-st-suite-b'),
    dict(id='aiea', name='Aiea', tab='Aiea', street='99-115 Aiea Heights Dr. #250', city='Aiea, HI 96701',
         coords=(21.3790, -157.9296), phone='(808) 487-6808', tel='+18084876808', drive='10–20 minutes',
         place='https://maps.app.goo.gl/aSD6FYd2DPoCQg7B7', reserve='https://www.google.com/maps/reserve/v/dine/c/HFvPblyZHtM',
         order='https://order.toasttab.com/online/totoya-aiea-nro-99-115-aiea-heights-drive-unit-250'),
]
LANDMARKS = [
    ('hnl', 'HNL Airport', 'Daniel K. Inouye International Airport, Honolulu', 21.3325, -157.9203),
    ('waikiki', 'Waikīkī', 'Waikiki Beach, Honolulu, HI', 21.2771, -157.8276),
    ('moana', 'Ala Moana Center', 'Ala Moana Center, Honolulu, HI', 21.2915, -157.8435),
    ('downtown', 'Downtown', 'Iolani Palace, Downtown Honolulu, HI', 21.3069, -157.8583),
]
# O‘ahu's coastline from the Census cartographic boundary via glynnbird/usstatesgeojson/hawaii.geojson.
# Coordinates use the same regional extent as the map markers below.
COAST = '-166.9,346 -301.2,369.3 -347.1,372.2 -375.9,359.2 -401.7,310.7 -406,293 -373.6,279.3 -380.5,264.8 -396.5,253.5 -415,267.5 -438.9,173.9 -460.5,126.8 -489.4,89.9 -526.2,54.1 -579.7,28.1 -586,10.9 -585.2,-25.4 -590.2,-55.2 -620,-113.3 -659.9,-151.3 -703,-183.6 -744.5,-241.2 -738.9,-358.5 -740.7,-388.1 -748.5,-410.8 -798.7,-466.8 -887,-526.4 -881.4,-536.1 -810.2,-548.7 -614.9,-559.1 -551.5,-547.4 -415.5,-561.8 -357.6,-593.6 -357.5,-614.4 -366.1,-623.1 -362.1,-628.9 -275.4,-695.5 -235.3,-746 -235,-773.9 -226.4,-793.5 -144.6,-877.3 -86.2,-927.9 -7,-953.9 9.1,-968.4 65.5,-969.1 131.2,-894.3 156.3,-827.8 183.5,-783.2 200.4,-770.2 205.9,-721.4 202.8,-699.4 242.7,-640.8 274,-623.7 345.1,-524.7 341.3,-475.9 359.9,-467.5 377.2,-487.3 410.1,-477.5 421.1,-467.3 468.9,-378.1 467.6,-320.4 430.2,-312.4 420.9,-281.2 442.8,-173.8 456.5,-150.3 505.9,-137 532.2,-120.3 539.5,-88.3 564.1,-55.3 623.4,-8.5 643.9,-13.9 660.4,-27 667.3,-59 659,-131.6 667.3,-144.7 690.7,-156.3 722.3,-156.3 773.3,-149 791.2,-138.9 792.5,-102.5 778.8,-82.2 763.6,-35.7 762.2,-5.2 770.2,28.1 796,36 802,35.2 807.6,32.8 814,31.3 815.6,31.4 817.2,31.6 818.9,31.9 819.4,32.2 821.6,36.9 823.9,43.5 830.6,54.6 861.2,96 861.9,109 849.9,142.6 856,176.2 861.5,192.7 897.4,247.7 907.5,259 1005.2,323 1036.2,320.4 1033.6,337.2 1030.4,358.9 905.1,449.8 905.7,473.7 888.2,481.8 858.8,487.9 845.9,482.4 845,473.7 853.6,455.9 851.1,425.5 844.7,415.5 823.3,407.7 713.3,436.5 689.4,433.6 648.9,451.1 603.3,493.4 552.7,502.2 517.5,492.8 508.3,479.9 504.6,457.9 484.4,431.7 442.1,397.7 306.4,344.4 292.5,301.9 278.9,276.8 261,271.1 217.7,305.2 220.8,320.8 234.5,329.9 242.3,346.7 115.6,344.3 120.3,324.9 116.8,304.8 67.5,274.9 51.1,276.7 1.8,307.2 -105.7,335.3 -166.9,346'

def external(url, text, cls='', **attrs):
    extras = ''.join(f' {key}="{escape(value, quote=True)}"' for key, value in attrs.items())
    target = '' if url.startswith('tel:') else ' target="_blank" rel="noopener"'
    return f'<a class="{cls}" href="{escape(url, quote=True)}"{target}{extras}>{escape(text)}</a>'

def directions(store, origin=None):
    dest = 'TOTOYA, ' + store['street'] + ', ' + store['city']
    args = dict(api=1, destination=dest, travelmode='driving')
    if origin:
        args['origin'] = origin
    return 'https://www.google.com/maps/dir/?' + urlencode(args)

def menu_section():
    groups = []
    for i, (title, label, items) in enumerate(MENU):
        rows = []
        for name, desc, price in items:
            description = f'<p>{escape(desc)}</p>' if desc else ''
            rows.append(f'<li><div><h3>{escape(name)}</h3>{description}</div><span class="kv-price">{price}</span></li>')
        note = ('<p class="kv-menu-note">Our negitoro includes tuna, scallops, cucumber, herring roe, green onion, '
                'nori (2 pieces), wasabi and ocean salad.<br>Premium option: fresh egg yolk soy sauce +$1.50.</p>') if i == 0 else ''
        groups.append(f'<details class="kv-accordion"{" open" if i == 0 else ""}><summary><span>{escape(title)}</span><small>{escape(label)}</small></summary><ul>{"".join(rows)}</ul>{note}</details>')
    return f'''<section id="menu" class="kv-section kv-menu" aria-labelledby="menu-title"><div class="kv-wrap">
      <header class="kv-heading"><p class="kv-kicker">TOTOYA’s selection</p><h2 id="menu-title">Menu</h2>
      <p>One TOTOYA menu, at all three locations.</p>
      <a class="kv-link" href="/assets/totoya-all-locations-menu.pdf" target="_blank" rel="noopener">View full menu (PDF)</a></header>
      <div class="kv-menu-list">{''.join(groups)}</div>
      <p class="kv-fine">Consuming raw or undercooked meats, poultry, seafood, shellfish or eggs may increase your risk of foodborne illness, especially if you have certain medical conditions.</p>
    </div></section>'''

def point(lat, lon):
    return f'left:{(lon + 157.990) / .235 * 100:.2f}%;top:{(21.413 - lat) / .167 * 100:.2f}%'

def map_view():
    shops = ''.join(f'<a class="kv-pin" href="#{s["id"]}" data-select-store="{s["id"]}" style="{point(*s["coords"])}" aria-label="Show {s["name"]} shop details"><i aria-hidden="true"></i><b>{s["tab"]}</b></a>' for s in STORES)
    cities = ''.join(f'<span class="kv-landmark {key}" style="{point(lat,lon)}"><i></i><b>{name}</b></span>' for key,name,_,lat,lon in LANDMARKS)
    return f'''<div class="kv-map-box"><div class="kv-map" aria-label="South O‘ahu map, with three TOTOYA shops and local landmarks"><div class="kv-map-surface">
      <svg viewBox="0 0 720 540" preserveAspectRatio="none" width="720" height="540" aria-hidden="true" focusable="false"><polygon points="{COAST}"/></svg>
      <span class="kv-geography" aria-hidden="true">O‘ahu</span>{cities}{shops}</div><div class="kv-live-map" aria-hidden="true" inert aria-label="Interactive street map of TOTOYA locations on O‘ahu"></div></div>
      <p class="kv-map-key"><span>TOTOYA locations</span><span>Local landmarks</span><button data-map-reset type="button" hidden>Show all places</button><a class="kv-outline-credit" href="https://github.com/glynnbird/usstatesgeojson/blob/master/hawaii.geojson" target="_blank" rel="noopener">Map outline</a></p><p class="kv-map-note" data-map-note hidden>Colored areas are visual guides, not neighborhood boundaries.</p></div>'''

def shopping_actions(s):
    if s['reserve']:
        return external(s['reserve'], 'Reserve a table', 'kv-btn primary') + external(s['order'], 'Order takeout', 'kv-btn')
    return external(s['order'], 'Order takeout', 'kv-btn primary') + external('tel:' + s['tel'], 'Call the restaurant', 'kv-btn')

def shop_panel(s):
    ident = s['id']
    lat,lon = s['coords']
    return f'''<article id="{ident}" class="kv-shop" data-store="{ident}" data-label="{s['name']}" data-lat="{lat}" data-lon="{lon}">
      <div><p class="kv-kicker">TOTOYA</p><h3>{s['name']}</h3><address>{s['street']}<br>{s['city']}</address>
      <p class="kv-caption">Approximate drive from HNL</p><strong>{s['drive']}</strong><br>{external(directions(s, LANDMARKS[0][2]), 'Check route from the airport', 'kv-link')}</div>
      <div><h4>Visit us</h4>{external('tel:'+s['tel'], s['phone'], 'kv-phone')}
      <dl><div><dt>Lunch</dt><dd>11:00 am – 2:30 pm</dd></div><div><dt>Dinner</dt><dd>5:00 pm – 8:30 pm</dd></div><div><dt>Open</dt><dd>Daily</dd></div></dl>
      <div class="kv-actions">{shopping_actions(s)}</div>
      <div class="kv-map-links">{external(directions(s), 'Directions', 'kv-link', **{'data-directions':'true'})}{external(s['place'], 'View place on Google Maps', 'kv-link')}</div></div>
    </article>'''

def locations_section():
    starts = ''.join(f'<button type="button" data-start="{key}" data-lat="{lat}" data-lon="{lon}" data-origin="{name}" aria-pressed="false">{label}</button>' for key,label,name,lat,lon in LANDMARKS)
    tabs = ''.join(f'<a href="#{s["id"]}" id="visit-tab-{s["id"]}" data-tab="{s["id"]}">{s["tab"]}</a>' for s in STORES)
    return f'''<section id="shopinfo" class="kv-section kv-visit" aria-labelledby="shop-title"><div class="kv-wrap">
      <header class="kv-heading" id="reservations"><p class="kv-kicker">Your next TOTOYA moment</p><h2 id="shop-title">Come find us.</h2>
      <h3>Three neighborhoods. One TOTOYA.</h3><p>Find your closest shop, plan your visit, or pick up your favorites on the way home.</p></header>
      <div class="kv-locator" data-locator hidden><div class="kv-locator-top"><button type="button" class="kv-btn primary" data-current-location>Use my location</button>
      <p>Location access is optional. We do not save your location. Directions open in Google Maps.</p></div>
      <div class="kv-start"><span>Start from</span><div role="group" aria-label="Choose your starting point">{starts}</div></div>
      <p class="kv-status" aria-live="polite">Choose a starting area, or use your location to find a nearby TOTOYA.</p></div>
      {map_view()}
      <nav class="kv-tabs" aria-label="Choose a TOTOYA location">{tabs}</nav>
      <div class="kv-shop-list">{''.join(shop_panel(s) for s in STORES)}</div>
      <aside class="kv-next"><div><p class="kv-kicker">Next stop</p><h3>Kapolei</h3></div><p>Opening planned for late February.<br>More details to come.</p></aside>
      <p class="kv-fine">Airport drive times are approximate planning estimates, not live travel times. Traffic and your pickup point may change your trip. Check Google Maps before you leave.</p>
    </div></section>'''

def booking_dialog():
    panels = []
    for kind, title, desc, note in [('reserve', 'Reservations', 'Choose your location to reserve a table.', 'Online reservations are available for Kaimuki and Aiea. Please call Piikoi to ask about seating.'), ('order','Order online','Choose a TOTOYA location for pickup.','Pickup times and availability are shown on each shop’s ordering page.')]:
        links = []
        for s in STORES:
            url = s['order'] if kind == 'order' else s['reserve'] or ('tel:' + s['tel'])
            action = 'Order takeout' if kind == 'order' else ('Reserve a table' if s['reserve'] else 'Call to inquire')
            target = '' if url.startswith('tel:') else ' target="_blank" rel="noopener"'
            links.append(f'<a class="kv-option" href="{escape(url,quote=True)}"{target}><span><b>{s["tab"]}</b><small>{s["street"]}</small></span><span>{action}</span></a>')
        panels.append(f'<div data-booking-view="{kind}"><h2 id="visit-dialog-{kind}">{title}</h2><p>{desc}</p><div class="kv-option-list">{"".join(links)}</div><p class="kv-fine">{note}</p></div>')
    return f'''<dialog id="booking-dialog" class="kv-dialog" aria-labelledby="visit-dialog-reserve"><button type="button" class="kv-close" aria-label="Close location selector">Close ×</button>{''.join(panels)}</dialog>'''
