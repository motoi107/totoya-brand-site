# TOTOYA Hawaii

The public restaurant website runs at https://www.totoyahawaii.com through GitHub Pages.

## Editing

Run `python3 scripts/build_pages.py` and commit the generated HTML alongside the source. The shared layout, public routes and homepage composition live in `scripts/build_pages.py`. Editorial sections, menu and locations, and company pages have corresponding `kamata_*.py` modules and page stylesheets. The site uses EB Garamond and Lora with navy type, warm paper and a sage navigation rail. Preserve the existing `CNAME` when updating the site.

## Languages

English is served at the root. The six other languages have static pages under `/ja/`, `/zh-Hans/`, `/zh-Hant/`, `/ko/`, `/es/` and `/fr/`. Edit the corresponding JSON catalogs in `translations/` when changing visitor text. Placeholders such as `{0}` retain inline links and dynamic place names in each language. The build generates all navigation, alternate-language URLs and the sitemap.

## Menu and locations

The printed dine-in menu for all three stores is in `assets/totoya-all-locations-menu.pdf`. Keep the price list in `scripts/kamata_visit.py` and the four featured bowls in `scripts/kamata_sections.py` consistent with it. Each restaurant’s Toast menu supplies its live pickup availability and pricing.

The booking selector links to Toast for Kaimuki and Google Reserve for Aiea. Piikoi accepts walk-ins only. The store locator supports manual starting points and optional on-device nearest-store calculation. The interactive street map uses the local Leaflet distribution and OpenStreetMap tiles.

## Brand media

The homepage uses the approved Tokujo composition and the restaurant’s official logos and bowl photographs. Story and Moments play three silent full-HD loops from TOTOYA’s portrait film master. Public photography and film credits are at `/media-credits.html`.

## Public routes

The eight original HTML paths remain available. `/company/` includes the group profile, sister restaurants, careers and contact. `/privacy/` describes the public site’s visitor features.
