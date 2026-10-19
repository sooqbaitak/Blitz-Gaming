# Automatic order email setup (Netlify + Resend)

The function `netlify/functions/order-notification.mjs` is written to notify **sooqbaitak@gmail.com** when a new order is placed and when an order is marked Delivered. Email is not sent until this setup is complete.

## Configure the sender

1. Create a Resend account and verify a domain you control. Use a sender address on that verified domain; do not use an unverified Gmail address as the `from` address.
2. Create a Resend API key with permission to send email.
3. In Netlify, open **Site configuration → Environment variables** and add:
   - `RESEND_API_KEY` — your secret Resend API key (keep it server-side; do not prefix with `VITE_`).
   - `ORDER_NOTIFICATION_FROM` — for example `BLITZ Gaming <orders@your-verified-domain.com>` using a sender authorized by Resend.
4. Make sure Netlify's base directory is the repository root and `netlify.toml` points to `netlify/functions`.
5. Deploy again after adding the variables.
6. Place a test order and inspect Resend's email logs/delivery status. Then mark a test order Delivered and check for the completion email.

The destination address is currently fixed in the function to `sooqbaitak@gmail.com`.

## Email contents

The email includes the order code/status, customer name and phone, city/area, address, preferred language, item names/quantities/prices, subtotal, delivery fee, total, and a link to `/admin/orders?order=<order-code>`.

## Important limitation

The current app saves orders in browser local storage, not a shared database. Consequently, the notification can include the admin page URL, but that URL cannot load the order in a different browser/device yet. Checkout calls the notification function without waiting for or displaying email-provider failures. The public function also needs rate limiting and stronger server-side validation before production use. Do not rely on the email until the service is configured and tested.
