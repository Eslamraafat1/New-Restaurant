# E2E Tests — Crust & Crave

End-to-end tests written with **Playwright 1.63**, run on Desktop Chrome and Mobile Chrome (Pixel 7).
35 tests; request-level SEO checks run on desktop only, so a full run is 57 test runs.

## What is tested

| File | Checks |
|---|---|
| `smoke.spec.js` | 10 key pages return HTTP 200 with the correct title and no console/hydration errors; unknown route → 404 |
| `flows.spec.js` | Category page, dietary filter + search, price sorting, category rail; customiser live price; add to cart → cart count → cart subtotal + coupon → checkout totals → validation errors → demo order success |
| `preferences.spec.js` | Language switch → `lang="ar" dir="rtl"`, cookie, Arabic server HTML after reload; theme toggle persists; 404 pages for unknown route/product/category |
| `seo.spec.js` | robots.txt, sitemap.xml, canonical / Open Graph / Twitter tags, OG image, `noindex` on admin and checkout, JSON-LD (Restaurant, Menu, MenuItem, BreadcrumbList) |

## Run

```bash
cd e2e
npm ci
npx playwright install chromium
npm test                                   # against the live site
LOCAL=1 npm test                           # starts `npm start` in the app folder (build it first)
BASE_URL=http://localhost:3000 npm test    # against any running server
```

CI (`.github/workflows/e2e.yml`) lints, type-checks and builds the app, then runs this suite with `LOCAL=1` against the production build.
