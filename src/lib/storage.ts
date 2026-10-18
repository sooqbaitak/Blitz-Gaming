import type { Order, Product } from './types';
import { seedProducts } from './products';
import { hashPassword } from './utils';

const KEYS = {
  products: 'blitz_products_v1',
  orders: 'blitz_orders_v1',
  orderSeq: 'blitz_order_seq_v1',
  favorites: 'blitz_favorites_v1',
  cart: 'blitz_cart_v1',
  adminSession: 'blitz_admin_session_v1',
  settings: 'blitz_settings_v1',
} as const;

export const DEFAULT_ADMIN_PASSWORD = 'blitzadmin';

export const storeInfo = {
  storeName: 'Blitz Gaming',
  tagline: 'Your next PC starts here',
  whatsapp: '+970595210647',
  whatsappDigits: '970595210647',
  email: 'sooqbaitak@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61591200376695',
  instagram: 'https://www.instagram.com/blitzyard/',
  location: 'Hebron',
  freeDeliveryFrom: 1000,
  currency: '₪',
};

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadProducts(): Product[] {
  const stored = readJSON<Product[] | null>(KEYS.products, null);
  if (stored === null) {
    writeJSON(KEYS.products, seedProducts);
    return [...seedProducts];
  }
  return stored;
}

export function saveProducts(products: Product[]) {
  writeJSON(KEYS.products, products);
}

export function loadOrders(): Order[] {
  return readJSON<Order[]>(KEYS.orders, []);
}

export function saveOrders(orders: Order[]) {
  writeJSON(KEYS.orders, orders);
}

export function nextOrderSequence(): number {
  const current = readJSON<number>(KEYS.orderSeq, 1000);
  const next = current + 1;
  writeJSON(KEYS.orderSeq, next);
  return next;
}

export function loadFavorites(): string[] {
  return readJSON<string[]>(KEYS.favorites, []);
}

export function saveFavorites(ids: string[]) {
  writeJSON(KEYS.favorites, ids);
}

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(KEYS.adminSession) === '1';
}

export function setAdminAuthenticated(ok: boolean) {
  if (ok) sessionStorage.setItem(KEYS.adminSession, '1');
  else sessionStorage.removeItem(KEYS.adminSession);
}

export function getAdminPasswordHash(): string {
  const settings = readJSON<{ adminPasswordHash?: string }>(KEYS.settings, {});
  return settings.adminPasswordHash ?? hashPassword(DEFAULT_ADMIN_PASSWORD);
}

export function setAdminPassword(password: string) {
  const settings = readJSON<Record<string, unknown>>(KEYS.settings, {});
  settings.adminPasswordHash = hashPassword(password);
  writeJSON(KEYS.settings, settings);
}

export function verifyAdminPassword(password: string): boolean {
  return hashPassword(password) === getAdminPasswordHash();
}

export function buildOrderMailto(order: Order): string {
  const lines = [
    `New Blitz Gaming Order — ${order.code}`,
    ``,
    `Status: ${order.status}`,
    `Date: ${new Date(order.createdAt).toLocaleString()}`,
    ``,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `General area: ${order.deliveryRegion ?? 'Not specified (older order)'}`,
    `City: ${order.city}`,
    `Address: ${order.address}`,
    order.notes ? `Notes: ${order.notes}` : '',
    ``,
    `Payment: Cash on Delivery (COD)`,
    ``,
    `Items:`,
    ...order.items.map((i) => {
      const vars = Object.entries(i.selectedVariants)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      return `• ${i.title} x${i.quantity} — ${i.unitPrice.toFixed(2)} ₪${vars ? ` (${vars})` : ''}`;
    }),
    ``,
    `Subtotal: ${order.subtotal.toFixed(2)} ₪`,
    `Delivery: ${order.deliveryFee === 0 ? 'FREE' : order.deliveryFee.toFixed(2) + ' ₪'}`,
    `TOTAL: ${order.total.toFixed(2)} ₪`,
    ``,
    `Order code for tracking: ${order.code}`,
  ].filter((l) => l !== undefined);

  const subject = encodeURIComponent(`[Blitz Gaming] New Order ${order.code}`);
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:${storeInfo.email}?subject=${subject}&body=${body}`;
}

export function buildWhatsAppOrderLink(order: Order): string {
  const text = encodeURIComponent(
    `Hello Blitz Gaming! I just placed order ${order.code}. Name: ${order.customerName}. Delivery area: ${order.deliveryRegion ?? 'Not specified'}. Total: ${order.total.toFixed(2)} ₪ (COD).`,
  );
  return `https://wa.me/${storeInfo.whatsappDigits}?text=${text}`;
}
