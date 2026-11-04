# E2E Tests — Crust & Crave

End-to-end tests written with **Playwright 1.63**, run on Desktop Chrome and Mobile Chrome (Pixel 7).
60 tests; request-level SEO checks run on desktop only, so a full run is 99 test runs (21 skipped on mobile).

## What is tested

| File | Checks |
|---|---|
| `smoke.spec.js` | 15 key pages (10 EN, 5 AR) return HTTP 200 with the correct title and no console/hydration errors; unknown route → 404 |
| `flows.spec.js` | Category page, dietary filter + search, price sorting, category rail; customiser live price; add to cart → cart count → cart subtotal + coupon → checkout totals → validation errors → demo order success |
| `i18n.spec.js` | `/ar/…` server HTML is `lang="ar" dir="rtl"`, English twins `ltr`; cookie never redirects `/`; `/en/…` → 308; Arabic pages only link to `/ar/…`; switcher maps `/menu/pizza` ⇄ `/ar/menu/pizza` (cookie set, query kept); full Arabic order flow under `/ar` |
| `preferences.spec.js` | Theme toggle persists (and survives a language switch); 404 pages for unknown route/product/category in EN and AR |
| `seo.spec.js` | robots.txt, sitemap.xml (both languages + hreflang alternates), canonical / hreflang / og:locale / Open Graph / Twitter tags on EN and AR pages, OG image, `noindex` on admin and checkout, JSON-LD (Restaurant, Menu, MenuItem, BreadcrumbList) |

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
