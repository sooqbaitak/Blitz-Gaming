import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice, calcDeliveryFee } from '../lib/utils';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, products, updateCartQty, removeFromCart, cartSubtotal, variantsKey } = useStore();
  const delivery = calcDeliveryFee('Hebron');
  const total = cartSubtotal + delivery;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0d1118] border-l border-white/10 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h2 className="font-semibold text-lg">Shopping cart</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              <p>Your cart is empty</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 text-violet-400 text-sm hover:underline"
              >
                Continue shopping
              </button>
            </div>
          )}
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return null;
            const vk = variantsKey(item.selectedVariants);
            return (
              <div key={`${item.productId}-${vk}`} className="flex gap-3">
                <img
                  src={product.image}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover bg-black/40"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                  {Object.keys(item.selectedVariants).length > 0 && (
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {Object.entries(item.selectedVariants)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-violet-300 mt-1">
                    {formatPrice(item.unitPrice)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"
                      onClick={() => updateCartQty(item.productId, vk, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"
                      onClick={() => updateCartQty(item.productId, vk, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      className="ml-auto p-1.5 text-zinc-500 hover:text-red-400"
                      onClick={() => removeFromCart(item.productId, vk)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-white/8 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal ({cart.reduce((s, c) => s + c.quantity, 0)} items)</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Delivery (estimate)</span>
              <span>{formatPrice(delivery)}+</span>
            </div>
            <p className="text-[11px] text-zinc-600">West Bank ₪20 · Jerusalem ₪50 · 1948 Areas ₪70. Exact fee is based on your selection at checkout.</p>
            <div className="flex justify-between font-semibold text-lg">
              <span>Estimated total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold hover:opacity-90 transition"
            >
              Checkout — Cash on Delivery
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="block w-full text-center py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5"
            >
              View cart
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
