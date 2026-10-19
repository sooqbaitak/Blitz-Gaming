const STORE_EMAIL = 'sooqbaitak@gmail.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function currency(amount) {
  return `${Number(amount || 0).toFixed(2)} ₪`;
}

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'POST' } });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_NOTIFICATION_FROM;
  if (!apiKey || !from) {
    return new Response(JSON.stringify({ error: 'Email service is not configured. Add RESEND_API_KEY and ORDER_NOTIFICATION_FROM in Netlify environment variables.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { event, order } = payload ?? {};
  if (!['new_order', 'order_delivered'].includes(event) || !order || typeof order.code !== 'string' || !Array.isArray(order.items) || order.items.length > 100) {
    return new Response(JSON.stringify({ error: 'Invalid order notification payload' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  if (!order.customerName || !order.customerPhone || !order.city || !Number.isFinite(Number(order.total))) {
    return new Response(JSON.stringify({ error: 'Order is missing required details' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Use only server-provided/request origins; never trust a URL supplied in the public request body.
  const configuredOrigin = process.env.URL || process.env.DEPLOY_PRIME_URL;
  let origin = configuredOrigin || new URL(request.url).origin;
  try {
    const checked = new URL(origin);
    if (!['https:', 'http:'].includes(checked.protocol)) throw new Error('Invalid protocol');
    origin = checked.origin;
  } catch {
    origin = new URL(request.url).origin;
  }
  const adminUrl = `${origin}/admin/orders?order=${encodeURIComponent(order.code)}`;
  const isDelivered = event === 'order_delivered';
  const subject = isDelivered
    ? `[BLITZ Gaming] Order ${order.code} marked delivered`
    : `[BLITZ Gaming] New order ${order.code}`;

  const itemRows = order.items.map((item) => {
    const variantText = item.selectedVariants && typeof item.selectedVariants === 'object'
      ? Object.entries(item.selectedVariants).map(([key, value]) => `${key}: ${value}`).join(', ')
      : '';
    return `<tr><td style="padding:9px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.title)}${variantText ? `<br><small>${escapeHtml(variantText)}</small>` : ''}</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;text-align:center">${Math.max(1, Number(item.quantity) || 1)}</td><td style="padding:9px;border-bottom:1px solid #e5e7eb;text-align:right">${currency(Number(item.unitPrice) * Math.max(1, Number(item.quantity) || 1))}</td></tr>`;
  }).join('');

  const text = [
    subject,
    `Order code: ${order.code}`,
    `Status: ${isDelivered ? 'delivered' : (order.status || 'pending')}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Area: ${order.city}`,
    `Address: ${order.address || ''}`,
    `Preferred language: ${order.preferredLanguage || 'English'}`,
    `Payment: Cash on Delivery`,
    ...order.items.map((item) => `${item.title} x${item.quantity} - ${currency(Number(item.unitPrice) * Number(item.quantity))}`),
    `Subtotal: ${currency(order.subtotal)}`,
    `Delivery: ${currency(order.deliveryFee)}`,
    `TOTAL: ${currency(order.total)}`,
    `Admin order page: ${adminUrl}`,
  ].join('\n');

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#18181b;line-height:1.5"><div style="max-width:700px;margin:auto;padding:24px"><h1 style="margin-bottom:4px">BLITZ Gaming</h1><p style="color:#71717a;margin-top:0">${isDelivered ? 'Order completed' : 'New order received'}</p><h2>Order ${escapeHtml(order.code)}</h2><p><b>Status:</b> ${isDelivered ? 'Delivered' : escapeHtml(order.status || 'Pending')}<br><b>Date:</b> ${escapeHtml(order.createdAt || new Date().toISOString())}</p><h3>Customer details</h3><p><b>Name:</b> ${escapeHtml(order.customerName)}<br><b>Phone:</b> ${escapeHtml(order.customerPhone)}<br><b>Area:</b> ${escapeHtml(order.city)}<br><b>Address:</b> ${escapeHtml(order.address || '')}<br><b>Preferred language:</b> ${escapeHtml(order.preferredLanguage || 'English')}<br><b>Notes:</b> ${escapeHtml(order.notes || '—')}</p><h3>Items</h3><table style="border-collapse:collapse;width:100%;font-size:14px"><thead><tr><th style="text-align:left;padding:9px;background:#f4f4f5">Product</th><th style="text-align:center;padding:9px;background:#f4f4f5">Qty</th><th style="text-align:right;padding:9px;background:#f4f4f5">Price</th></tr></thead><tbody>${itemRows}</tbody></table><p style="text-align:right">Subtotal: <b>${currency(order.subtotal)}</b><br>Delivery: <b>${currency(order.deliveryFee)}</b><br><span style="font-size:20px">Total: <b>${currency(order.total)}</b></span></p><p style="margin:28px 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#6d28d9;color:white;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Open order in admin dashboard</a></p><p style="font-size:12px;color:#71717a">The order link opens the admin order page on the deployed site. Because this project currently stores orders in local browser storage, shared order visibility requires the database backend to be configured.</p></div></body></html>`;

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [STORE_EMAIL], subject, text, html }),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Email provider rejected the request');
    return new Response(JSON.stringify({ error: 'Email provider failed', details: errorText.slice(0, 500) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
