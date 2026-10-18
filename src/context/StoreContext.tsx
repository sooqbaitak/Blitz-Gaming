import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, DeliveryRegion, Order, OrderStatus, Product } from '../lib/types';
import {
  buildOrderMailto,
  isAdminAuthenticated,
  loadFavorites,
  loadOrders,
  loadProducts,
  nextOrderSequence,
  saveFavorites,
  saveOrders,
  saveProducts,
  setAdminAuthenticated,
  storeInfo,
  verifyAdminPassword,
} from '../lib/storage';
import { calcDeliveryFee, generateOrderCode, slugify, uid } from '../lib/utils';

interface StoreContextValue {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  favorites: string[];
  cartCount: number;
  cartSubtotal: number;
  isAdmin: boolean;
  storeInfo: typeof storeInfo;
  addToCart: (productId: string, qty?: number, variants?: Record<string, string>) => void;
  updateCartQty: (productId: string, variantsKey: string, qty: number) => void;
  removeFromCart: (productId: string, variantsKey: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  getProduct: (idOrSlug: string) => Product | undefined;
  addProduct: (data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'> & { slug?: string }) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  placeOrder: (input: {
    customerName: string;
    customerPhone: string;
    deliveryRegion: DeliveryRegion;
    city: string;
    address: string;
    notes?: string;
  }) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  findOrderByCode: (code: string) => Order | undefined;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  variantsKey: (v: Record<string, string>) => string;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function variantsKey(v: Record<string, string>): string {
  return Object.entries(v)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, val]) => `${k}:${val}`)
    .join('|');
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProducts(loadProducts());
    setOrders(loadOrders());
    setFavorites(loadFavorites());
    setIsAdmin(isAdminAuthenticated());
    try {
      const c = localStorage.getItem('blitz_cart_v1');
      if (c) setCart(JSON.parse(c));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveProducts(products);
  }, [products, ready]);

  useEffect(() => {
    if (!ready) return;
    saveOrders(orders);
  }, [orders, ready]);

  useEffect(() => {
    if (!ready) return;
    saveFavorites(favorites);
  }, [favorites, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem('blitz_cart_v1', JSON.stringify(cart));
  }, [cart, ready]);

  const getProduct = useCallback(
    (idOrSlug: string) => products.find((p) => p.id === idOrSlug || p.slug === idOrSlug),
    [products],
  );

  const addToCart = useCallback(
    (productId: string, qty = 1, selectedVariants: Record<string, string> = {}) => {
      const product = products.find((p) => p.id === productId);
      if (!product || product.stock === 'out_of_stock') return;
      const key = variantsKey(selectedVariants);
      setCart((prev) => {
        const idx = prev.findIndex(
          (c) => c.productId === productId && variantsKey(c.selectedVariants) === key,
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
          return next;
        }
        return [
          ...prev,
          { productId, quantity: qty, selectedVariants, unitPrice: product.price },
        ];
      });
    },
    [products],
  );

  const updateCartQty = useCallback((productId: string, vKey: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.productId === productId && variantsKey(c.selectedVariants) === vKey
            ? { ...c, quantity: qty }
            : c,
        )
        .filter((c) => c.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string, vKey: string) => {
    setCart((prev) =>
      prev.filter(
        (c) => !(c.productId === productId && variantsKey(c.selectedVariants) === vKey),
      ),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'> & { slug?: string }) => {
      const now = new Date().toISOString();
      const baseSlug = slugify(data.slug || data.title) || 'product';
      let slug = baseSlug;
      let suffix = 2;
      while (products.some((existing) => existing.slug === slug)) slug = `${baseSlug}-${suffix++}`;
      const product: Product = {
        ...data,
        id: uid('prod'),
        slug,
        createdAt: now,
        updatedAt: now,
      };
      setProducts((prev) => [product, ...prev]);
      return product;
    },
    [products],
  );

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        let slug = data.slug ?? (data.title ? slugify(data.title) : p.slug);
        if (data.title && data.title !== p.title) {
          const baseSlug = slug || 'product';
          slug = baseSlug;
          let suffix = 2;
          while (prev.some((other) => other.id !== id && other.slug === slug)) slug = `${baseSlug}-${suffix++}`;
        }
        return { ...p, ...data, id: p.id, updatedAt: new Date().toISOString(), slug };
      }),
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    // Remove deleted products from saved cart/favorites so checkout cannot reference a missing item.
    setCart((prev) => prev.filter((item) => item.productId !== id));
    setFavorites((prev) => prev.filter((favoriteId) => favoriteId !== id));
  }, []);

  const placeOrder = useCallback(
    (input: {
      customerName: string;
      customerPhone: string;
      deliveryRegion: DeliveryRegion;
      city: string;
      address: string;
      notes?: string;
    }) => {
      const items = cart.map((c) => {
        const product = products.find((p) => p.id === c.productId)!;
        return {
          productId: c.productId,
          title: product.title,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          selectedVariants: c.selectedVariants,
          brand: product.brand,
        };
      });
      const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const deliveryFee = calcDeliveryFee(subtotal);
      const seq = nextOrderSequence();
      const now = new Date().toISOString();
      const order: Order = {
        id: uid('ord'),
        code: generateOrderCode(seq),
        items,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        deliveryRegion: input.deliveryRegion,
        city: input.city,
        address: input.address,
        notes: input.notes,
        paymentMethod: 'cod',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      // Open mailto for Gmail notification
      try {
        const link = buildOrderMailto(order);
        window.open(link, '_blank');
      } catch {
        /* ignore */
      }
      return order;
    },
    [cart, products],
  );

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o,
      ),
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const findOrderByCode = useCallback(
    (code: string) =>
      orders.find((o) => o.code.toUpperCase() === code.trim().toUpperCase() && o.status !== 'deleted'),
    [orders],
  );

  const loginAdmin = useCallback((password: string) => {
    const ok = verifyAdminPassword(password);
    if (ok) {
      setAdminAuthenticated(true);
      setIsAdmin(true);
    }
    return ok;
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0),
    [cart],
  );

  const value: StoreContextValue = {
    products,
    orders,
    cart,
    favorites,
    cartCount,
    cartSubtotal,
    isAdmin,
    storeInfo,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    toggleFavorite,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    placeOrder,
    updateOrderStatus,
    deleteOrder,
    findOrderByCode,
    loginAdmin,
    logoutAdmin,
    variantsKey,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
