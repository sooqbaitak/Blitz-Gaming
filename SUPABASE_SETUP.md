# Customer account authentication setup

The `/account` page supports registration/sign-in using either an email address or phone number when Supabase Auth is configured.

## 1. Configure Supabase Auth

1. Create a Supabase project.
2. Open **Project Settings → API** and copy the **Project URL** and **anon/public key**. Never put a `service_role` key in frontend code or commit it to GitHub.
3. In **Authentication → Providers**, enable Email. To support phone registration, also enable Phone and configure an SMS provider; phone verification depends on your Supabase provider settings.
4. Locally, copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. In Netlify, open **Site configuration → Environment variables**, add the same two `VITE_` values, and trigger a new deploy.

## 2. Current integration scope

This is customer identity registration/sign-in only. It does **not** currently store shared products, images, orders, site settings, ratings or loyalty balances. Those remain in the current browser's local storage. Accounts therefore do not yet have a secure cross-device order history or shared loyalty account.

Without Supabase variables, a local `npm run dev` run exposes a clearly marked browser-only preview account flow. Production builds intentionally disable local preview account registration/sign-in rather than implying that browser storage is a real online account system.

## 3. Required next step for a live store

Create a shared database and API for products, orders, settings, ratings and loyalty data; upload images to cloud storage; and enforce administrator authorization on the server. Do not expose a Supabase `service_role` key to the browser. Client-side UI/login checks are not access control.
