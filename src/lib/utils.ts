export function formatPrice(amount: number, currency = '₪'): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Simple non-cryptographic hash for admin password (client-side gate). */
export function hashPassword(password: string): string {
  let h = 0;
  const s = `bg_salt_v1_${password}`;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `h${(h >>> 0).toString(16)}`;
}

export function generateOrderCode(sequence: number): string {
  const num = String(sequence).padStart(6, '0');
  return `BG${num}`;
}

export const FREE_DELIVERY_FROM = 1000;
export const DEFAULT_DELIVERY_FEE = 25;

export function calcDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DEFAULT_DELIVERY_FEE;
}
