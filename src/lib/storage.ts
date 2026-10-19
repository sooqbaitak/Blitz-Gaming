import type { Order, Product, StoreSettings } from './types';
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
  siteSettings: 'blitz_site_settings_v1',
  loyaltyBalances: 'blitz_loyalty_balances_v1',
  productRatings: 'blitz_product_ratings_v1',
} as const;

export const DEFAULT_ADMIN_PASSWORD = 'blitzadmin';

export const DEFAULT_SITE_SETTINGS: StoreSettings = {
  storeName: 'Blitz Gaming',
  tagline: 'Hebron PC Store',
  logoUrl: '',
  heroImage: '/images/hero-gaming.jpg',
  heroTitle: 'Your next PC',
  heroAccentText: 'starts here',
  heroDescription: 'PC components and accessories — find the right fit for your setup. Genuine products with authorized warranty.',
  accentColor: '#8b5cf6',
  headingColor: '#f4f4f5',
  bodyTextColor: '#f4f4f5',
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  baseFontSize: 16,
  homeSectionOrder: ['categories', 'processors', 'motherboards', 'gpus', 'monitors', 'cases', 'cooling', 'psu', 'accessories', 'furniture'],
  homeGridColumns: 4,
  pageContent: {
    about: 'Blitz Gaming is your trusted store for genuine PC components and gaming gear in Palestine, based in {location}.\n\nWe offer authentic products, competitive prices, and cash on delivery across our listed delivery areas. Whether you need a single upgrade or a full custom build, our team is here to help.\n\nContact us on WhatsApp at {whatsapp} or email {email}.',
    shipping: 'We accept delivery requests for the West Bank, Jerusalem and 1948 Areas from our base in Hebron. Delivery fees are fixed by selected location: West Bank ₪20, Jerusalem ₪50 and 1948 Areas ₪70.\n\n- Cash on delivery (COD) — pay when you receive your order\n- West Bank: ₪20 delivery\n- Jerusalem: ₪50 delivery\n- 1948 Areas: ₪70 delivery\n- You will receive an order code (BG######) to track your order\n\nDelivery times depend on your city and product availability. Contact us for urgent orders.',
    returns: 'If you receive a defective or incorrect product, contact us within 48 hours with your order code and photos. We will arrange a replacement or exchange according to manufacturer warranty terms.\n\nOpened software, consumables, and custom-built PCs may have limited return options.',
    warranty: 'All products sold by Blitz Gaming are genuine and covered by the manufacturer’s authorized warranty where applicable. Keep your order code and invoice for warranty claims.\n\nFor warranty service, WhatsApp us with your order code (BG######) and product details.',
    privacy: 'We use the name, phone number, address and order details you provide to prepare and support your order. The current preview stores order information in this browser rather than in a shared store database.\n\nBefore accepting live orders, the store owner must connect secure server-side storage and publish a privacy and data-retention policy that accurately describes how customer information is handled.',
    terms: 'By placing an order on Blitz Gaming you agree to cash-on-delivery payment, accurate delivery details, and our return/warranty policies. Prices are in Israeli Shekels (₪) and may change without notice until an order is confirmed.\n\nProduct availability is subject to stock. We may cancel orders if items become unavailable.',
    support: 'Need help? Reach us anytime:',
    brands: 'Shop authentic products from leading brands.',
    offers: 'Featured deals and highlighted products.',
  },
  rewardThreshold: 100,
  rewardDescription: 'Redeem your points for a special reward. Ask us to claim your prize.',
  whatsapp: '+970595210647',
  email: 'sooqbaitak@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61591200376695',
  instagram: 'https://www.instagram.com/blitzyard/',
  location: 'Hebron',
  freeDeliveryFrom: 0,
  currency: '₪',
  adminPasswordHash: '',
};

export function loadSiteSettings(): StoreSettings {
  const stored = readJSON<Partial<StoreSettings>>(KEYS.siteSettings, {});
  return { ...DEFAULT_SITE_SETTINGS, ...stored, pageContent: { ...DEFAULT_SITE_SETTINGS.pageContent, ...stored.pageContent }, homeSectionOrder: stored.homeSectionOrder?.length ? stored.homeSectionOrder : DEFAULT_SITE_SETTINGS.homeSectionOrder };
}

export function saveSiteSettings(settings: StoreSettings) {
  writeJSON(KEYS.siteSettings, settings);
}

export function loadLoyaltyBalances(): Record<string, number> {
  return readJSON<Record<string, number>>(KEYS.loyaltyBalances, {});
}

export function saveLoyaltyBalances(balances: Record<string, number>) {
  writeJSON(KEYS.loyaltyBalances, balances);
}

export function currentCustomerAccountKey(): string | undefined {
  try {
    const session = JSON.parse(localStorage.getItem('blitz_customer_auth_session_v1') ?? 'null') as {
      contact?: string;
      contactType?: string;
      user?: { id?: string };
    } | null;
    if (!session) return undefined;
    if (session.user?.id) return `user:${session.user.id}`;
    if (session.contact) return `${session.contactType ?? 'contact'}:${session.contact.trim().toLowerCase()}`;
    return undefined;
  } catch {
    return undefined;
  }
}

export function loadProductRatings(): Record<string, { votes: number[]; myVote?: number }> {
  return readJSON<Record<string, { votes: number[]; myVote?: number }>>(KEYS.productRatings, {});
}

export function saveProductRatings(ratings: Record<string, { votes: number[]; myVote?: number }>) {
  writeJSON(KEYS.productRatings, ratings);
}

export const storeInfo = {
  storeName: 'Blitz Gaming',
  tagline: 'Your next PC starts here',
  whatsapp: '+970595210647',
  whatsappDigits: '970595210647',
  email: 'sooqbaitak@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61591200376695',
  instagram: 'https://www.instagram.com/blitzyard/',
  location: 'Hebron',
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
    `City / delivery area: ${order.city}`,
    `Preferred language: ${order.preferredLanguage ?? 'English (older order)'}`,
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
    `Hello Blitz Gaming! I just placed order ${order.code}. Name: ${order.customerName}. Location: ${order.city}. Preferred language: ${order.preferredLanguage ?? 'English'}. Total: ${order.total.toFixed(2)} ₪ (COD).`,
  );
  return `https://wa.me/${storeInfo.whatsappDigits}?text=${text}`;
}
