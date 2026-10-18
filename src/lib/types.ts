export type StockStatus = 'in_stock' | 'out_of_stock' | 'preorder';

export interface ProductVariant {
  id: string;
  name: string;
  type: 'color' | 'size' | 'other';
  options: string[];
  priceModifier?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  brand: string;
  tags: string[];
  category: string;
  subcategory?: string;
  label?: string;
  variants: ProductVariant[];
  stock: StockStatus;
  image: string;
  images?: string[];
  featured?: boolean;
  specs?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariants: Record<string, string>;
  unitPrice: number;
}

export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled' | 'deleted';

export type DeliveryRegion = 'West Bank' | 'Jerusalem' | '1948 Areas';

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  selectedVariants: Record<string, string>;
  brand: string;
}

export interface Order {
  id: string;
  code: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  /** Missing on older orders created before the general-area selector was added. */
  deliveryRegion?: DeliveryRegion;
  city: string;
  address: string;
  notes?: string;
  paymentMethod: 'cod';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  image?: string;
  children?: CategoryNode[];
}

export interface StoreSettings {
  storeName: string;
  whatsapp: string;
  email: string;
  facebook: string;
  instagram: string;
  location: string;
  freeDeliveryFrom: number;
  currency: string;
  adminPasswordHash: string;
}
