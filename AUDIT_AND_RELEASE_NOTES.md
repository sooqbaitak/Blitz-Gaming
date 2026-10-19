# BLITZ Gaming Store — Code Audit & Release Notes

## Changes made in this revision

1. **Product image gallery editor:** product admin accepts up to five image URLs or compressed uploads, previews and removes images, and saves a gallery for the product page.
2. **Structured product information:** product editor now separates Description, Specifications (entered as `Name: Value` lines and displayed in a table), and Shipping & warranty.
3. **Product ratings:** product pages offer a five-star rating input and display the average/count; the current votes are local to the browser.
4. **Loyalty points UI and logic:** each product can award per-unit points; account-linked orders calculate their earned points when the admin marks them Delivered. Admin settings define the points threshold and prize text, and the account page shows progress and a reward-claim link.
5. **Page/store customization:** admin settings can change store name/tagline, logo, homepage image/headline/description, accent and text colors, font family and size, homepage section order, product-grid columns, and editable text for key informational pages.
6. **Site language selector:** English, Arabic, and Hebrew can be selected in the global header and checkout/account flows. The runtime translates dictionary-mapped UI phrases on all routes and updates RTL direction for Arabic/Hebrew.
7. **Automatic email notification endpoint:** added `netlify/functions/order-notification.mjs`. When configured with a Resend API key and a verified sender, it emails `sooqbaitak@gmail.com` on new orders and when orders are marked Delivered, including the customer/order details and an admin order URL. See `EMAIL_SETUP.md`.
8. **Documentation/config:** documented environment configuration, current local-storage limitations, Netlify SPA/functions setup, and remaining production requirements.

## Delivery, language and admin routing

- Removed the separate General area checkout input and made `1948 Areas` a selectable delivery area.
- Delivery fees are fixed at **₪20** for West Bank/other locations, **₪50** for Jerusalem, and **₪70** for 1948 Areas; they do not change with subtotal.
- The preferred language is saved to new orders and shown in order details and notifications.
- The dashboard routes are declared in `src/App.tsx`: `/admin/login`, `/admin`, `/admin/products`, `/admin/orders`, and `/admin/settings`.
- The root `netlify.toml` and `public/_redirects` filenames are corrected. `netlify.toml` points at the `netlify/functions` directory and keeps the SPA fallback.

## Feature limitations to understand before launch

### Browser-local data (the most important blocker)

`src/lib/storage.ts` still stores products, orders, site settings, ratings and loyalty balances in browser `localStorage`. The UI and logic work in the same browser, but this is **not a shared database**. Customer orders from a phone won't appear on the seller's computer. Admin-added products, images uploaded as data URLs, settings, ratings and points won't sync to other visitors or devices. The email's admin-order link therefore cannot retrieve a remote order until shared order persistence exists.

### Images

Multiple image links and compressed uploads are supported by the editor. Uploaded images currently become data URLs stored in local storage. This is for preview/demo use only; production product images should live in cloud storage with public URLs referenced from a shared products table.

### Languages

The translation runtime applies curated Arabic/Hebrew phrase dictionaries to matching static UI strings across route changes. It is not a complete translation of every word/string. Descriptions and content written by the admin aren't machine-translated and remain as authored. For truly complete localized pages, use explicit translation keys and per-language content in the product/CMS schema.

### Loyalty and ratings

Points are awarded once locally when an account-linked order changes to Delivered. The ledger and order itself are stored only in browser storage, so this is not a secure cross-device loyalty service. Ratings are also per browser and can be manipulated; production ratings should be API-backed, rate-limited and attached to a customer or session identity.

### Email

The Resend-backed Netlify Function is implemented but sends nothing until `RESEND_API_KEY` and `ORDER_NOTIFICATION_FROM` are configured in Netlify and the sender domain is verified at the provider. The browser calls the function in a fire-and-forget path and does not currently block checkout or surface provider failures. Test with a verified sender and inspect Resend delivery logs before relying on it. Because the order isn't stored in a shared database, the admin URL may open the dashboard without the corresponding order on a different device.

### Security / order processing

- The admin password check is client-side and uses a browser-local password hash/session; it is not secure production admin authorization.
- The browser currently calculates order totals. Server-side price, inventory and delivery-fee validation is still needed.
- The public email function needs rate limiting/abuse controls before use on a real public checkout flow.
- Supabase Auth in the account page provides customer identity only; it does not yet back products/orders/loyalty/site settings.

**Recommendation:** use this build for preview/review until the shared database/API, shared cloud image storage, production admin authorization and secure order-email flow are connected. Do not accept live orders relying on the current local-only order list.

## Verification performed

- **TypeScript project check:** `node node_modules/typescript/bin/tsc -b` passed.
- **ESLint:** `node node_modules/eslint/bin/eslint.js .` passed.
- **Production bundle:** could not be completed in this Linux environment because the uploaded dependency folder lacks the Linux Rollup optional binary (`@rollup/rollup-linux-x64-gnu`) and contains Windows-specific binary files. Run a clean `npm ci`/`npm run build` in Netlify or another clean Linux environment after pushing.
- **Hosted end-to-end test:** not performed. No live Netlify deployment, Supabase project credentials, Resend API key, or verified sender domain was supplied.
