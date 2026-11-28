# TOTOYA neighborhood analytics

The GitHub Pages dashboard at /analytics/ can read a Search Console queries CSV locally. For the live Google flow, enable the Search Console API for a Google OAuth web client with the JavaScript origin https://www.totoyahawaii.com (include the apex only if serving there). An authorized property reader enters the public client ID, selects the verified domain or URL-prefix property, and signs in. The token stays in memory. The result uses date, query, search country, device and destination page, in Pacific time. Google omits some queries. A CSV export only supplies the dimensions present in its Queries table. No Google credentials or CSV rows are published.

## Existing production collector

Mount the two visit routes and their readiness endpoint in the existing TOTOYA production analytics Worker, with its existing DB binding. Copy handler.mjs and its analytics/areas.mjs dependency into the corresponding relative source paths, import withAreas in the Worker entry point, and wrap the existing default export. Bundle the entry point as usual. The wrapper passes through every request outside /api/areas/. Apply areas.sql to that same DB before publishing. This is an additive migration and can be retried. The new paths do not replace the pageview collector or its report.

    import {withAreas} from './area-service/handler.mjs';
    export default withAreas(existingWorker);

GET /api/areas/ready returns version 1 only after the migration is readable. Until then the visitor-facing analytics opt-in stays hidden. GET /api/areas/report?period=7 shows only aggregate counts. The existing public report should still return the same totals for a fixed period before and after deployment. Smoke-test read endpoints on production; test write scenarios in a fixture database.

POST /api/areas/visit accepts only the current production pageview ID and an enumerated result, with numeric board and subdistrict codes for a district match. It links to an existing recent pageview and records once per session. Boundaries and uncertain fixes remain unclassified. Precise coordinates never leave the device for this feature. GPC, DNT and the existing opt-out disable it. Counts by district, subdivision or weekday/hour are displayed only for cohorts of five or more. Totals include smaller cohorts; no-data means unavailable, never an inferred zero. Pre-launch visits have no retrospective neighborhood assignment.

Boundaries and subdistrict names come from Honolulu Land Information System, City and County of Honolulu, AdministrativePolitical/FeatureServer/5. The same-origin bundled GeoJSON contains 128 features in WGS84 (simplification 0.00008°, precision 5 decimals), retrieved November 28, 2026. The classifier allows an additional 12 m boundary margin. Official source https://services.arcgis.com/tNJpAOha4mODLkXz/arcgis/rest/services/AdministrativePolitical/FeatureServer/5

Run the area regression checks with Node 24 or newer:

    node --test area-service/areas.test.mjs
