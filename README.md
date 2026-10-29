# CRUST & CRAVE – restaurant storefront (front-end)

A fictional pizza / crepe / burger brand: cinematic GSAP scroll scenes, a full digital menu, live product customiser,
cart + demo checkout, English/Arabic (RTL), light/dark themes. Built with **Next.js 16 (App Router, Cache Components), React 19, Tailwind 4,
GSAP + ScrollTrigger, Framer Motion, Lenis**.

> Read `AGENTS.md` first: this Next.js version has breaking changes; docs live in `node_modules/next/dist/docs/`.

## Run
```bash
npm install
cp .env.example .env.local      # demo mode is the default
npm run dev                     # http://localhost:3000
npm run build && npm start      # production
npm run lint && npx tsc --noEmit
```

## Hand-off to the backend
Start with **`docs/BACKEND_INTEGRATION.md`** (endpoints, payloads, rules the server must re-implement).
In short: set `NEXT_PUBLIC_USE_DEMO_API=false` and `NEXT_PUBLIC_API_BASE_URL=<real api>`; the UI needs no other change.
Demo orders are **simulated in the browser** – they never reach a restaurant.

## Where things are
| Path | What |
|---|---|
| `lib/brand.ts` | name, currency, fees, demo coupons, contact placeholders |
| `app/globals.css` | design tokens (colours, light/dark), shared classes |
| `lib/api/*` | the only data layer: `types.ts`, `config.ts`, `client.ts`, `menu/products/categories/content/orders.ts` |
| `data/demo/*` | demo catalogue, options, offers, branches, copy |
| `lib/pricing.ts` | price/total calculation and option validation (display only; server must recompute) |
| `lib/cart.ts`, `lib/store.ts` | persisted cart/wishlist (localStorage) |
| `lib/i18n/*` | EN/AR dictionary + `useI18n()` (`t`, `l`, `money`) |
| `components/art/*` | layered SVG food illustrations (pizza live preview, crepe, burger) |
| `components/home/*` | homepage scenes (GSAP pinned scenes, hero, reel) |
| `components/fx/*` | site-wide GSAP effects (scroll reveals, tilt, cursor, intro curtain) |
| `components/menu`, `product`, `cart`, `chrome`, `pages` | menu, product page/customiser, cart+checkout, header/footer/drawers, static pages |
| `app/api/*` | demo Route Handlers mirroring the API contract (delete once the real API exists) |

## Routes
`/`, `/menu`, `/menu/[category]`, `/product/[slug]`, `/cart`, `/checkout`, `/order`, `/offers`, `/about`, `/our-story`, `/ingredients`,
`/contact`, `/locations`, `/faq`, `/privacy`, `/terms`, `/admin` (read-only, **unauthenticated preview**), 404 and error pages.

## Accessibility & motion
Reduced-motion users get no GSAP/Lenis/cursor effects (final states are shown statically). Dialogs trap focus and restore it; forms have labelled,
described errors; controls are keyboard operable.

## Known limits (see `IMPLEMENTATION_STATUS.md`)
Illustrated (vector) food art, not photography. Payments, authentication, order persistence and a real admin are backend work.
Legal text, contact details, branches and reviews are placeholders/sample and are labelled as such.
