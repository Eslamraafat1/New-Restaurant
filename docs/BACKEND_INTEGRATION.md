# Backend integration guide

The storefront is finished on the front-end side. It talks to data **only** through `lib/api/*`
(components never contain URLs). Everything runs in **demo mode** until you flip one env var.

## 1. Switching to the real backend

| Env var | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_USE_DEMO_API` | `true` | `false` → `lib/api/*` calls the real backend |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api` | **Example only – replace with the real API address.** No trailing slash |

Copy `.env.example` to `.env.local` and edit. Restart `next dev` / rebuild after changing (these are build-time `NEXT_PUBLIC_*` values).

Demo mode simulates orders in the browser (`lib/api/orders.ts`): nothing is stored, nothing reaches a restaurant.
The demo Route Handlers in `app/api/*` mirror the contract below for reference and are not used by the UI.
Delete them when the real API exists.

CORS: the browser calls `NEXT_PUBLIC_API_BASE_URL` directly, so the backend must allow the storefront origin
(or put the backend behind the same origin / a Next.js rewrite).

## 2. Endpoints the front-end calls

All JSON. Types live in `lib/api/types.ts` – that file is the source of truth for every field.

| Method | Path | Returns | Used by |
|---|---|---|---|
| GET | `/categories` | `Category[]` | menu, footer, nav |
| GET | `/products` | `Product[]` | menu, search, home, cart lookups |
| GET | `/products/:id` | `Product` (404 if unknown) | product page (server-side) |
| GET | `/menu` | `{ categories, products }` | catalog loader |
| GET | `/offers` | `Offer[]` | offers page / home |
| GET | `/branches` | `Branch[]` | locations, pickup selector |
| POST | `/orders` | `OrderResponse` | checkout |
| POST | `/contact` | `{ ok: true }` | contact form |

Loading / error / empty states already exist for the menu; failures surface through `ApiError` (`lib/api/errors.ts`).
The checkout success screen is shown **only** after `POST /orders` resolves with HTTP 2xx.

### Product (excerpt – see `lib/api/types.ts`)
```json
{
  "id": "margherita", "slug": "margherita", "category": "pizza",
  "name": { "en": "Margherita", "ar": "مارجريتا" },
  "description": { "en": "…", "ar": "…" },
  "basePrice": 140, "art": "pizza", "customizer": "pizza",
  "options": [
    { "id": "size", "kind": "single", "required": true, "name": { "en": "Size", "ar": "الحجم" },
      "choices": [ { "id": "medium", "name": { "en": "Medium 11\"", "ar": "وسط ١١\"" }, "price": 0 } ] },
    { "id": "toppings", "kind": "multi", "max": 6, "name": { "en": "Toppings", "ar": "الإضافات" }, "choices": [ … ] }
  ],
  "defaults": { "size": ["medium"], "sauce": ["marinara"], "toppings": ["basil"] },
  "badges": ["bestseller"], "tags": ["vegetarian"], "allergens": ["gluten", "dairy"],
  "ingredients": [ { "en": "Tomato", "ar": "طماطم" } ],
  "prepMinutes": 15, "rating": 4.8, "ratingCount": 214, "popularity": 98, "available": true
}
```
* Every user-facing string is `{ en, ar }`.
* `choices[].price` is an **additional** price; it is free when the choice id is in `defaults[groupId]` ("included").
* `calories`, `prepMinutes`, `rating`, `allergens` are optional – the UI hides them when absent.
* `art` / `customizer` pick the illustration + configurator (`pizza | crepe | burger | null`); ids used by the live preview
  (toppings `pepperoni, mushroom, olive, pepper, onion, basil`; extras `x-pepperoni, x-mushroom, x-olive`; sauces `marinara, ranch, bbq, pesto`;
  cheese `regular, extra`; crust `classic, thin, sourdough, stuffed`) must keep these ids for the picture to react.
* The product images are vector illustrations generated in code, so there is no image field. Add one if you introduce photography.

### POST /orders
Request (`OrderRequest`):
```json
{
  "lines": [
    { "key": "margherita::cheese=regular|crust=classic|…", "productId": "margherita",
      "config": { "size": ["medium"], "sauce": ["ranch"], "toppings": ["basil"], "extras": ["x-pepperoni"] },
      "qty": 1, "unitPrice": 165, "note": "no onions" }
  ],
  "customer": { "name": "Test User", "phone": "01012345678", "email": "a@b.co" },
  "fulfilment": "delivery", "address": "12 Test street, Cairo",
  "branchId": null, "notes": "ring twice", "payment": "cash", "coupon": "CRAVE10"
}
```
Response `201`/`200` (`OrderResponse`):
```json
{ "id": "ORD-10492", "demo": false, "status": "accepted", "createdAt": "2026-10-29T12:00:00Z",
  "totals": { "subtotal": 285, "discount": 0, "delivery": 30, "total": 315 }, "request": { … echo … } }
```
Errors: return `4xx` with `{ "error": "message", "fields": { "phone": "invalid" } }`. The UI shows a generic retry message today;
map `fields` onto the form if you want field-level server errors (`components/cart/CheckoutView.tsx`).

## 3. Rules the backend MUST re-implement (never trust the client)
Prices, totals, coupons and delivery fees are computed client-side **for display only** (`lib/pricing.ts`, `lib/brand.ts`):
1. Recompute `unitPrice` from `productId` + `config`: `basePrice + Σ price of selected choices that are not in defaults`.
2. Validate: required single groups have exactly one choice, multi groups respect `max`, choices exist and are `available`.
3. Recompute subtotal, apply coupon (demo codes `CRAVE10` = 10 %, `WELCOME30` = EGP 30 – move to the server), delivery fee
   (`deliveryFee` 30, free over 400) and return authoritative `totals`.
4. Reject unavailable products, closed branches, invalid phone/address.
5. Payment: the UI offers *cash* and a *card UI preview only*. No card data is collected. Integrate a hosted payment page / payment
   intent server-side; never put secrets in `NEXT_PUBLIC_*`.

## 4. Things still local (decide when you integrate)
| Item | Where | Notes |
|---|---|---|
| FAQ, ingredient stories, sample reviews | `data/demo/content.ts` | editorial content; move to a CMS/endpoint if needed |
| Brand name, currency, fees, coupons, contact placeholders | `lib/brand.ts` | `contact` values are placeholders – replace |
| Cart, wishlist, language, theme | `localStorage` (`lib/store.ts`) | no server session; add accounts if required |
| Last order shown on `/order` | `localStorage` key `cc-last-order` | fetch `GET /orders/:id` instead if you add order tracking |
| Admin screen `/admin` | `components/pages/Info.tsx` | **read-only preview, no auth.** Remove it or build a real authenticated admin |
| Sample branches / reviews | flagged `sample` | replace with real data; map links only render when `mapUrl` is set |

Opening hours appear in the footer only when `brand.hours` is set. Offer expiry dates show only when `endsAt` is provided.

## 5. i18n
All UI strings: `lib/i18n/dictionary.ts` (en + ar, typed – a missing Arabic key fails the build). Data strings come from `{en, ar}` objects.
Language is chosen client-side (localStorage); `<html lang/dir>` are set before first paint. Currency is `brand.currency` (EGP) formatted via `Intl`.

## 6. Verification checklist after wiring the API
- `NEXT_PUBLIC_USE_DEMO_API=false`, backend running → `/menu` lists backend products, `/product/<slug>` renders.
- Add a customised pizza → cart line shows options; checkout → backend receives the payload above → `/order` shows the backend id.
- Stop the backend → menu shows the error state with a Retry button; checkout shows the error banner (no success screen).
- `npm run build` (pages are pre-rendered from the API at build time; falls back to demo data if the API is unreachable).
