# BLITZ Gaming Store

A React + TypeScript + Vite storefront with product browsing, cart, checkout, account UI, order tracking, and a browser-local admin dashboard. The source directory is the project root; run commands from this `blitz-gaming-store` folder.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Main routes

### Storefront

- `/` — homepage and configurable product-section layout
- `/shop` — all products
- `/category/:slug` and `/product/:slug` — category and product pages
- `/cart` and `/checkout` — shopping cart and checkout
- `/track` — order tracking
- `/account` — customer account create/sign-in screen
- `/build`, `/favorites`, `/shipping`, `/support`, and other information pages

### Admin

- `/admin/login` — admin login
- `/admin` — overview dashboard
- `/admin/products` — add, search, edit, and delete products
- `/admin/orders` — view local orders and change their status
- `/admin/settings` — store identity, logo, homepage text/image, typography/colors, section order, product-grid layout, loyalty reward threshold, and prize description

The admin routes are included in the React app. Netlify uses `netlify.toml` and `public/_redirects` to support direct/nested SPA links such as `/admin/login`.

## Features in this revision

### Delivery and preferred language

The separate **General area** selector is removed. Buyers select a city/delivery area, including **1948 Areas**. Current delivery rates are fixed by area, not cart total:

- West Bank/other locations: **₪20**
- Jerusalem: **₪50**
- 1948 Areas: **₪70**

The buyer selects English, Arabic, or Hebrew. The chosen language is saved to the order and shown in admin order details.

### Product editing

The product form supports up to five image links or compressed local uploads, a product description, a specifications table (`Name: Value`, one per line), shipping & warranty text, per-unit loyalty points, and existing product/stock/variant fields. Product detail pages show the gallery, specs, shipping/warranty section and five-star rating UI.

**Image uploads currently become compressed data URLs saved in this browser.** For a real public catalog, upload images to cloud storage and save their public URLs in a shared product database; links to already hosted product images can be used in the meantime.

### Site customization

The admin settings editor supports store name/tagline, logo, hero image and copy, accent/heading/body colors, font family/base font size, 2/3/4-column homepage product grids, reordering of homepage sections, and editable copy for the About, Shipping, Returns, Warranty, Privacy, Terms, Support, Brands, and Offers pages. Settings currently save to the admin browser's local storage.

### Languages

The language selector applies English, Arabic or Hebrew across the React UI. Arabic and Hebrew set right-to-left document direction. Static text included in the translation dictionaries is translated automatically across route changes. This is a phrase-based UI translation, **not** a complete professional translation service: product descriptions, free-form CMS text, and unmapped phrases remain in their authored language.

### Loyalty

Products can award an integer number of points per unit. Points are calculated for account-linked orders when an admin marks the order **Delivered**; the customer account page shows progress toward the configured reward threshold and prize. To avoid awarding points before fulfilment, points are not awarded at checkout.

The current balances are browser-local and are not secure or shared between the customer's devices. Do not use the present points ledger for a live loyalty program until it is moved to server-side storage and the delivery event is verified server-side.

### Order email alerts

A Netlify Function at `netlify/functions/order-notification.mjs` sends an email to `sooqbaitak@gmail.com` on order placement and when an order is marked Delivered. It uses the Resend email API, keeping the API key server-side. Setup: follow [`EMAIL_SETUP.md`](./EMAIL_SETUP.md) and set `RESEND_API_KEY` plus `ORDER_NOTIFICATION_FROM` in Netlify's server-side environment variables.

The email includes customer/order details and a link to `/admin/orders?order=<order-code>`. Since orders are currently stored in browser local storage, this deep link **cannot retrieve an order placed on another device**. A shared order database is required for the link to reliably open the right order. The function is not proof that an email was delivered to the inbox; check provider logs and test it before relying on it.

### Customer accounts

The `/account` page supports email-address or phone-number registration/sign-in via Supabase Auth when configured. See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md). Without Supabase, the development-only preview flow uses browser storage. Supabase Auth by itself does not share the catalog/orders/loyalty data.

## Deployment

The repository root is intended to be the Netlify base directory:

- Build command: `npm run build`
- Publish directory: `dist`
- Netlify Functions directory: `netlify/functions`
- `public/_redirects` provides the SPA fallback.

`.gitignore` excludes `node_modules/`, `dist/`, local environment files and common generated files. `.env.example` contains placeholders only. After pushing changes to GitHub, trigger a fresh Netlify deploy. If the existing Netlify base directory points to an old nested folder, change it to the repository root.

## Production readiness warning

**This project is still a preview, not a safe live-store backend.** Product data, orders, site settings, ratings and loyalty balances use browser local storage. An order placed on a customer's phone does not automatically appear in the seller's admin browser. Products created/edited in the admin browser will not automatically reach other shoppers. The admin password check is client-side and not production access control. Browser-supplied order totals are not server-validated.

Before accepting real customer orders, connect a shared database/API and cloud image storage, secure admin access server-side, validate prices/stock/delivery fees on the server, tie loyalty points to verified customer IDs and delivered orders, and add abuse/rate-limiting protections to the notification endpoint. See [`AUDIT_AND_RELEASE_NOTES.md`](./AUDIT_AND_RELEASE_NOTES.md).

## Checks

```bash
npm run build
npm run lint
```
