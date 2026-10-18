# Blitz Gaming Store

A React + TypeScript + Vite storefront with product browsing, cart, checkout, order tracking, and an admin dashboard.

## Preview in Chrome (Windows)

1. Install **Node.js 20.19+ or 22.12+** if it is not already installed.
2. Extract this ZIP into a normal folder (do not run it from inside the ZIP viewer).
3. Double-click **`Preview in Chrome.bat`**. On its first run it installs project dependencies, starts Vite, and opens the local site in Chrome when Chrome is found.
4. The local storefront URL is `http://localhost:5173/`; the dashboard login is `http://localhost:5173/admin/login`.

If the script cannot find Chrome, open `http://localhost:5173/` manually in Chrome. Keep the terminal window running while previewing the website.

### Manual commands

```bash
npm install
npm run dev
```

Production asset build:

```bash
npm run build
npm run preview
```

## Admin dashboard

- `/admin/login` — sign in
- `/admin` — overview cards and recent pending orders
- `/admin/products` — add, search, edit, and delete products
- `/admin/orders` — view orders and change order status
- `/admin/settings` — store information and the demo password-change form

The current demo admin password is `blitzadmin`. It is visible in the client source and **is not secure for a public deployment**. Do not use the current client-side login as real access control.

## Important publishing limitation — read before going live

This project is currently a **front-end demo**, not a production commerce backend:

- Products, orders, cart, favorites, and settings are stored in the browser's `localStorage` / `sessionStorage`.
- Product changes made from the dashboard are visible in the same browser profile only. They do not update other customers' devices.
- Customer orders are saved in the customer's browser and do not automatically appear in the store owner's browser.
- Admin access is checked in client-side code; changing the demo password does not provide server-side security.
- Order email notification uses a `mailto:` draft. It is not an automatic email service, and the browser/device may not have an email handler configured.

**Do not publish this version as a live store that collects customer data or relies on real orders until a server-side API, shared database, server-side authentication, and reliable order notifications are connected.** A static/Vite preview is suitable for reviewing the design and testing the UI only.

## Build/check commands

- `npm run build` — TypeScript project build followed by Vite production bundling
- `npm run lint` — ESLint check

The source audit and functional limitations are documented in `AUDIT_AND_RELEASE_NOTES.md`.
