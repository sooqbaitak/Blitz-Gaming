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

export const DELIVERY_FEES = {
  default: 20,
  jerusalem: 50,
  areas1948: 70,
} as const;

/** Calculate delivery by the buyer's selected city/area, not order subtotal. */
export function calcDeliveryFee(cityOrArea = ''): number {
  const location = cityOrArea.trim().toLocaleLowerCase();
  if (location === 'jerusalem') return DELIVERY_FEES.jerusalem;
  if (location === '1948 areas') return DELIVERY_FEES.areas1948;
  return DELIVERY_FEES.default;
}
