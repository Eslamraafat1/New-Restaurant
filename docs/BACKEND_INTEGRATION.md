# Backend integration

The storefront talks to data only through `lib/api/*`. Demo mode is the default.

| Env var | Default | Meaning |
|---|---|---|
| `NEXT_PUBLIC_USE_DEMO_API` | `true` | `false` makes `lib/api/*` call the real backend |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api` | **Example only.** Replace with the backend developer's real address |

Demo orders are simulated in the browser (`lib/api/orders.ts`). They are not stored and never reach a restaurant.
Demo Route Handlers under `app/api/*` mirror the same shapes for reference; the UI does not call them in demo mode.

## Endpoints (types in `lib/api/types.ts`)
- `GET /categories` → `Category[]`
- `GET /products` → `Product[]`; `GET /products/:id` → `Product` (404 if unknown)
- `GET /menu` → `{ categories, products }`
- `GET /offers` → `Offer[]` (`endsAt` only when a real date exists)
- `POST /orders` body `OrderRequest` → `OrderResponse` (`status: "accepted"` ONLY once the order is really accepted; the success screen depends on it)
- `POST /contact` body `{name,email,message}` → `{ok:true}`

## Rules the backend must re-implement
Prices in `lib/pricing.ts` are computed client-side for display only. The server MUST recompute the unit price from
`productId` + `config` (base + non-included choice prices), validate option limits (`max`, required singles,
availability), and apply coupons and delivery fees itself. Never trust client totals. Keep payment credentials out of client code.

`/admin` is a read-only preview with no authentication; a real admin area needs server-side auth.
