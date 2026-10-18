# Blitz Gaming — Code Audit & Release Notes

## Changes made

1. **Checkout:** removed the buyer email/Gmail field. The required phone field now uses phone-friendly browser hints and validation that ignores spaces and punctuation when checking the number length.
2. **Checkout:** added a required **General area** selector with exactly these options: **West Bank**, **Jerusalem**, and **1948 Areas**. Kept the separate city selector and address field so delivery details are not lost.
3. **Order data flow:** the selected general area is saved on each new order, included in the order-notification email draft, shown in the admin order details/list, and shown on the customer order-tracking page. Older local orders without this property display as not specified instead of crashing.
4. **Product dashboard:** editing a product retains any additional variants that the current editor does not expose, reducing the risk of silently deleting variant data.
5. **Product URLs:** new products and renamed products receive a unique slug when a slug collision occurs, avoiding two products resolving to the same product page.
6. **Dashboard metric:** the sales total now counts delivered orders only, which is more truthful for a cash-on-delivery store than counting every pending order as revenue.
7. **Privacy cleanup:** removed embedded session-replay instrumentation that recorded cursor movement, clicks, scrolls, and interactions, and removed the third-party page-view request. Also disabled the injected Vite source-location tagging helper so source file paths are not added to rendered elements.
8. **Reliability:** deleting a product now also removes it from this browser's cart/favorites, and an intentionally empty catalog stays empty after reload instead of silently restoring demo products. Added a not-found page for unmatched URLs.
9. **Store copy:** aligned delivery messaging with the selectable areas without changing delivery-fee calculations.
10. **Preview setup:** added Windows `Preview in Chrome.bat` and updated setup, preview, build, and publishing notes in `README.md`.

## Route and data-flow review

The app routes are present in `src/App.tsx`:

- Storefront: `/`, `/shop`, `/category/:slug`, `/product/:slug`, `/cart`, `/checkout`, `/track`, `/build`, `/favorites`, and the information pages.
- Admin: `/admin/login`, `/admin`, `/admin/products`, `/admin/orders`, and `/admin/settings`.

The product editor calls `addProduct`, `updateProduct`, and `deleteProduct` from the same `StoreContext` used by storefront product listing/detail components. Within one browser profile, product changes flow through the in-memory store and are written to local storage. Dashboard cards link to the relevant product/orders routes, and the new general-area field is connected through checkout → order model → admin/order mail draft/tracking view.

## Additional behavior notes

- The general-area selector records the buyer's area but deliberately does not change the existing delivery-fee formula; fees are still 25 ₪ below 1,000 ₪ and free at or above 1,000 ₪ for every area. Confirm whether Jerusalem/1948 Areas need different fees before going live.
- Product images are currently entered by URL, not uploaded through the dashboard. The Settings page shows store information and changes the browser-stored demo password; it does not edit contact details or delivery rules.

## Findings that block a real launch

**Status: not production-ready for live customer orders.** This is not a visual/design defect; it is a data and security architecture limitation in the supplied code.

- There is no shared server/database. The `src/lib/storage.ts` functions use browser local storage. Different customers and the store owner's device do not share product/order state.
- The admin login is front-end only, uses a default password (`blitzadmin`), and stores its session in the browser. The password hash and check are not a security boundary once publicly deployed.
- The checkout notification uses a `mailto:` link. It may open an email compose window, but it does not send automatically and is not a dependable order notification service.
- No server-side stock/price validation exists at order submission time.

Before accepting real orders, connect a server API and shared database, move admin authentication to the server, validate order prices/stock on the server, configure real email/WhatsApp order handling, and set up hosting with HTTPS and SPA route fallback. Avoid using real customer data in the current demo.

## Verification notes

- Static route/context inspection: completed.
- Requested checkout/order-area wiring: patched and statically inspected.
- TypeScript/JSX syntax transpilation: passed for all 32 TypeScript/TSX source files. This is a syntax check only, not full type checking.
- Privacy/tracking scan: removed the identified interaction/session-replay and page-view scripts; a source scan found no remaining designarena/rrweb instrumentation.
- Full Vite production build, ESLint, and browser-driven runtime tests could not be executed in the preparation environment because external npm registry DNS resolution was unavailable and dependencies were not preinstalled. Run `npm install`, `npm run build`, and `npm run lint` on a machine with npm registry access before release.

Do not treat a successful local preview as a substitute for backend/security work listed above.
