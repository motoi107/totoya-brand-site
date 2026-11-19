# TOTOYA Hawaii

Official subtitle: **Japanese Negitoro & Seafood Bowls**.

Brand palette: deep navy (#142c4e), cool white (#f7f9fc), and pale blue (#eaf0f7).

Static public website for https://www.totoyahawaii.com, hosted from this repository through GitHub Pages.

## Editing

- Page content and shared header/footer: `scripts/build_pages.py`
- Responsive styling: `style.css`
- Navigation and accessible video playback: `nav.js`
- Photography and video: `assets/`

After updating content, run `python3 scripts/build_pages.py` and commit the generated HTML with the source changes. Preserve `CNAME` and the existing hosting configuration.

## Content verification — November 19, 2026

- Official Instagram profile: https://www.instagram.com/totoya_hawaii/
- November 17 Hand-roll Set post: https://www.instagram.com/totoya_hawaii/p/Df3TPyGmlrC/
  - Kaimuki exclusive, takeout only, 600g sushi rice, 20 nori sheets, serves 2–3.
- October 28 reservation announcement: https://www.instagram.com/totoya_hawaii/p/DfEL_vcAV1K/
  - Kaimuki and Aiea now accept reservations; also explicitly confirmed by the owner for this update.
- Kaimuki online reservation form: https://toast.app/r/totoya-hawaii
- Aiea reservation CTA uses the existing store telephone, +1 (808) 487-6808. No unverified online-booking URL is used.
- Official Kaimuki takeout menu: https://order.toasttab.com/online/totoya-hawaii
- Official Piikoi takeout menu: https://order.toasttab.com/online/totoya-ala-moana-436-piikoi-st-suite-b
- Official Aiea takeout menu: https://order.toasttab.com/online/totoya-aiea-nro-99-115-aiea-heights-drive-unit-250
  - All three menus list Ume $18.90, Take $26.90, Matsu $34.90, and Tokujo $38.90. These are labeled takeout prices on the site; dine-in prices were not verified.
  - Kaimuki lists the Hand-roll Set at $75. Contents and quantities displayed on the site come from this official menu and the Instagram post.
- Kapolei: owner instructed “opening planned for late February.” No year, precise date, street address, hours, or booking availability has been invented.
- Existing store addresses, telephone numbers, and operating hours were preserved from the prior website.

## Images and video

The portrait brand film and its extracted stills originate from the owner's existing `totoya-hero.mp4`. `assets/hero-loop.mp4` removes the black Instagram outro and preserves the source footage. Original files are retained.

The Hand-roll Set and official takeout bowl photos are from TOTOYA's official Toast menu. The site uses an editorial desktop video layout and a portrait mobile layout rather than inventing a landscape source.

## Scope and accessibility

The eight existing page URLs are preserved. The website has no new tracking or booking backend. Order and booking buttons link to verified official services, and Aiea reservations use the store telephone. The shared navigation supports keyboard use and the film has a pause control, a still poster, reduced-motion handling, and connection-aware loading.
