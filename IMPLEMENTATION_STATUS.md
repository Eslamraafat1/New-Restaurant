# Implementation status

## Hand-off status (backend-ready)
- Read `README.md` then `docs/BACKEND_INTEGRATION.md`. All catalogue, offers and branches data flow through `lib/api/*` (demo or real, one env switch).
- Verified in a production build in **demo mode**: all 20 pages return 200; add customised pizza (price 165 = 140 + ranch 10 + extra pepperoni 15) → cart → checkout validation → order accepted → cart cleared → success screen; no console errors.
- Verified in **live mode** (`NEXT_PUBLIC_USE_DEMO_API=false`, the demo route handlers acting as the backend): `/menu` fetched categories/products/offers/branches (28 products), add-to-cart and checkout render; demo wording (banner, button, success text) is hidden. A live-mode prerender crash on `/admin` was found and fixed.
- Remaining backend work: real `POST /orders` (+ server-side price recomputation), payments, auth/admin, order persistence, real branches/contacts/legal text.

## Final QA (production build)
- 252 automated checks: 18 pages x 7 widths (320, 390, 430, 768, 1024, 1440, 1920) x EN/AR (RTL): 0 real horizontal scrolls, 0 unclipped overflow, 0 console errors.
- Found and fixed during QA: real horizontal scroll on the home page at 1024px (`main { overflow-x: clip }`), product sticky-bar button overflowing at 320px, header logo wrapping to 3 lines at 320px.
- Visually inspected: hero (EN/AR, light/dark, mobile/desktop), pinned pizza/crepe/burger scenes, reel, menu, product, checkout, order confirmation, header at 320/360.
- Not visually inspected page-by-page: every static page (about/faq/legal/contact) in Arabic and at tablet widths – only checked for overflow/console errors.

## Update – illustrated art restored + GSAP creative layer
The stock-photo experiment was reverted by request; the layered SVG illustration art is back (palette, Arabic typography, responsive and hydration fixes kept).
New GSAP/creative work: letter-flip hero with toppings flying in + 3D pointer tilt + scroll-out; pizza assembly with sauce splash, cheese rain, cut lines, ingredient callouts, steam;
crepe heat-glow/shake/powdered sugar; burger shockwave rings + camera shake + sesame burst; pinned horizontal signature reel with 3D cards;
velocity-driven skewing marquee; falling-ingredients finale; site-wide scroll reveals, card batch entrances, 3D card tilt, custom cursor, brand curtain.
Verified in headless Chrome against a production build: no console errors; the pinned scenes, reel and hero were inspected at 1440px and the hero at 390px (EN + AR); no horizontal overflow from 320 to 1920px.
Also inspected at 390px: reel (native carousel), crepe, burger and assembly scenes; dark mode hero/menu/product/assembly; reduced-motion hero (static final state).
Performance fix: the full-section SVG feTurbulence grain overlay dropped headless-Chrome FPS to ~1; replaced by a pre-rendered noise tile (60 FPS in the same test). The outlined hero word is promoted to its own layer.

## Validation actually performed
- `next build` (Next 16.4.3, Cache Components): passes, 63 static/PPR pages.
- `eslint .`: 0 problems. `tsc --noEmit`: 0 errors.
- HTTP smoke test on a production server: all page routes, `/api/menu` and `/api/products/:id` return 200; unknown route returns 404.
  `/product/<unknown>` returns HTTP 200 (streamed PPR response) although it renders the not-found UI.

## NOT tested (no browser automation available in this session)
Visual QA at 320–1920px, timing and mobile fit of the pinned GSAP scenes (pizza/crepe/burger), Arabic/RTL visual check,
dark/light appearance, reduced-motion behaviour, customiser interactions, cart/checkout click-through, dialog focus behaviour,
browser console errors. The code implements these, but they are unverified; expect visual tuning.

## Built
Brand config (`lib/brand.ts`), design tokens (`app/globals.css`), EN/AR dictionary with RTL, light/dark/system theme with
a pre-paint script, typed API layer + demo route handlers, demo data (28 products), cart with per-configuration lines, edit and
coupons (CRAVE10, WELCOME30), wishlist, search dialog (Ctrl+K), toasts, scroll progress, back-to-top, floating cart, Lenis.
Menu: sticky category rail, search, dietary filters, sort, grid/list, quick view, mobile filter drawer, skeleton/error/empty states.
Product pages with live SVG pizza/crepe/burger layers and priced options, demo checkout with validation, order confirmation.
20 homepage sections incl. GSAP-pinned pizza, crepe and burger scenes, flavour switch + wheel, ingredient orbit,
clip-path sauce reveal, magnetic CTAs, word-by-word heading, floating gallery. Info/legal/admin/404/error pages.

## Gaps / deviations
- Food art is hand-built layered SVG illustration, not photography (no photo assets available).
- Crepe "fold" is a squash + crossfade to a folded illustration, not a true fold.
- No Three.js/R3F scene and no Lottie were added; layered 2D was chosen per the brief.
- Cinematic product transition: only the Quick View modal; no cross-route shared-layout animation.
- Crepe customiser reuses the generic option UI with crepe-specific art, not a fully separate interface.
- Language/theme preference loads from localStorage after hydration (brief English text flash possible for Arabic users; dir/theme set pre-paint).
- Reviews, branches, contact details and ratings are sample/placeholder data and labelled as such.
- Payments, real orders, auth and persistence are not implemented (demo only).
