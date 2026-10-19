import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Order, OrderStatus, PreferredLanguage, Product, StoreSettings } from '../lib/types';
import {
  currentCustomerAccountKey,
  isAdminAuthenticated,
  loadLoyaltyBalances,
  loadProductRatings,
  loadSiteSettings,
  loadFavorites,
  loadOrders,
  loadProducts,
  nextOrderSequence,
  saveFavorites,
  saveLoyaltyBalances,
  saveProductRatings,
  saveSiteSettings,
  saveOrders,
  saveProducts,
  setAdminAuthenticated,
  storeInfo,
  verifyAdminPassword,
} from '../lib/storage';
import { calcDeliveryFee, generateOrderCode, slugify, uid } from '../lib/utils';
import { TranslationRuntime } from '../components/TranslationRuntime';

interface StoreContextValue {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  favorites: string[];
  cartCount: number;
  cartSubtotal: number;
  isAdmin: boolean;
  storeInfo: typeof storeInfo;
  siteSettings: StoreSettings;
  updateSiteSettings: (patch: Partial<StoreSettings>) => void;
  language: PreferredLanguage;
  setLanguage: (language: PreferredLanguage) => void;
  loyaltyBalances: Record<string, number>;
  customerLoyaltyPoints: number;
  refreshLoyaltyBalances: () => void;
  rateProduct: (productId: string, rating: number) => void;
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
    city: string;
    preferredLanguage: PreferredLanguage;
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

const LANGUAGE_KEY = 'blitz_preferred_language_v1';

function variantsKey(v: Record<string, string>): string {
  return Object.entries(v)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, val]) => `${k}:${val}`)
    .join('|');
}

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem('blitz_cart_v1');
    return saved ? (JSON.parse(saved) as CartItem[]) : [];
  } catch {
    return [];
  }
}

async function sendOrderNotification(order: Order, event: 'new_order' | 'order_delivered'): Promise<void> {
  try {
    await fetch('/.netlify/functions/order-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, order, origin: window.location.origin }),
    });
  } catch {
    // The order stays placed locally; deployment diagnostics/setup notes explain email requirements.
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [isAdmin, setIsAdmin] = useState(() => isAdminAuthenticated());
  const [siteSettings, setSiteSettings] = useState<StoreSettings>(() => loadSiteSettings());
  const [loyaltyBalances, setLoyaltyBalances] = useState<Record<string, number>>(() => loadLoyaltyBalances());
  const [language, setLanguageState] = useState<PreferredLanguage>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return saved === 'Arabic' || saved === 'Hebrew' ? saved : 'English';
  });

  useEffect(() => saveProducts(products), [products]);
  useEffect(() => saveOrders(orders), [orders]);
  useEffect(() => saveFavorites(favorites), [favorites]);
  useEffect(() => saveSiteSettings(siteSettings), [siteSettings]);
  useEffect(() => saveLoyaltyBalances(loyaltyBalances), [loyaltyBalances]);
  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language === 'Arabic' ? 'ar' : language === 'Hebrew' ? 'he' : 'en';
    document.documentElement.dir = language === 'English' ? 'ltr' : 'rtl';
    document.documentElement.style.setProperty('--site-accent', siteSettings.accentColor || '#8b5cf6');
    document.documentElement.style.setProperty('--site-heading-color', siteSettings.headingColor || '#f4f4f5');
    document.documentElement.style.setProperty('--site-text-color', siteSettings.bodyTextColor || '#f4f4f5');
    document.documentElement.style.setProperty('--site-font-family', siteSettings.fontFamily || 'Inter, ui-sans-serif, system-ui, sans-serif');
    document.documentElement.style.setProperty('--site-base-font-size', `${siteSettings.baseFontSize || 16}px`);
  }, [language, siteSettings.accentColor, siteSettings.headingColor, siteSettings.bodyTextColor, siteSettings.fontFamily, siteSettings.baseFontSize]);
  useEffect(() => localStorage.setItem('blitz_cart_v1', JSON.stringify(cart)), [cart]);

  const getProduct = useCallback(
    (idOrSlug: string) => products.find((p) => p.id === idOrSlug || p.slug === idOrSlug),
    [products],
  );

  const updateSiteSettings = useCallback((patch: Partial<StoreSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setLanguage = useCallback((nextLanguage: PreferredLanguage) => {
    setLanguageState(nextLanguage);
  }, []);

  const refreshLoyaltyBalances = useCallback(() => setLoyaltyBalances(loadLoyaltyBalances()), []);

  const rateProduct = useCallback((productId: string, rating: number) => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
    const ratings = loadProductRatings();
    const record = ratings[productId] ?? { votes: [] };
    const votes = [...record.votes];
    if (record.myVote) {
      const previousVoteIndex = votes.indexOf(record.myVote);
      if (previousVoteIndex >= 0) votes.splice(previousVoteIndex, 1);
    }
    votes.push(rating);
    ratings[productId] = { votes, myVote: rating };
    saveProductRatings(ratings);
    setProducts((prev) => prev.map((product) => product.id === productId
      ? { ...product, rating: votes.reduce((sum, vote) => sum + vote, 0) / votes.length, ratingCount: votes.length, updatedAt: new Date().toISOString() }
      : product));
  }, []);

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
      city: string;
      preferredLanguage: PreferredLanguage;
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
          loyaltyPointsEach: Math.max(0, Math.floor(product.loyaltyPoints ?? 0)),
        };
      });
      const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const deliveryFee = calcDeliveryFee(input.city);
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
        city: input.city,
        preferredLanguage: input.preferredLanguage,
        customerAccountKey: currentCustomerAccountKey(),
        address: input.address,
        notes: input.notes,
        paymentMethod: 'cod',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      void sendOrderNotification(order, 'new_order');
      return order;
    },
    [cart, products],
  );

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    const existing = orders.find((order) => order.id === id);
    const now = new Date().toISOString();
    let awardedPoints = existing?.loyaltyPointsAwarded ?? 0;
    let awardedAt = existing?.loyaltyAwardedAt;

    if (existing && status === 'delivered' && existing.status !== 'delivered' && !existing.loyaltyAwardedAt && existing.customerAccountKey) {
      awardedPoints = existing.items.reduce((sum, item) => sum + Math.max(0, item.loyaltyPointsEach ?? 0) * item.quantity, 0);
      awardedAt = awardedPoints > 0 ? now : undefined;
      if (awardedPoints > 0) {
        setLoyaltyBalances((previous) => ({ ...previous, [existing.customerAccountKey!]: (previous[existing.customerAccountKey!] ?? 0) + awardedPoints }));
      }
    }

    setOrders((prev) => prev.map((order) => order.id === id
      ? { ...order, status, updatedAt: now, ...(awardedAt ? { loyaltyPointsAwarded: awardedPoints, loyaltyAwardedAt: awardedAt } : {}) }
      : order));
    if (existing && status === 'delivered' && existing.status !== 'delivered') void sendOrderNotification({ ...existing, status, updatedAt: now, loyaltyPointsAwarded: awardedPoints, loyaltyAwardedAt: awardedAt }, 'order_delivered');
  }, [orders]);

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
    storeInfo: { ...storeInfo, storeName: siteSettings.storeName, tagline: siteSettings.tagline, email: siteSettings.email, whatsapp: siteSettings.whatsapp, facebook: siteSettings.facebook, instagram: siteSettings.instagram, location: siteSettings.location },
    siteSettings,
    updateSiteSettings,
    language,
    setLanguage,
    loyaltyBalances,
    customerLoyaltyPoints: (() => { const key = currentCustomerAccountKey(); return key ? (loyaltyBalances[key] ?? 0) : 0; })(),
    refreshLoyaltyBalances,
    rateProduct,
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

  return <StoreContext.Provider value={value}><TranslationRuntime language={language} />{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
