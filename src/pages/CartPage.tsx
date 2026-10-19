import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice, calcDeliveryFee } from '../lib/utils';

export function CartPage() {
  const { cart, products, updateCartQty, removeFromCart, cartSubtotal, variantsKey, clearCart } =
    useStore();
  const delivery = calcDeliveryFee('Hebron');
  const total = cartSubtotal + delivery;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Shopping cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/8 bg-[#12141c]">
          <p className="text-zinc-400 mb-4">Your cart is empty</p>
          <Link
            to="/shop"
            className="inline-flex px-6 py-3 rounded-xl bg-violet-600 font-semibold hover:bg-violet-500"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;
              const vk = variantsKey(item.selectedVariants);
              return (
                <div
                  key={`${item.productId}-${vk}`}
                  className="flex gap-4 p-4 rounded-2xl border border-white/8 bg-[#12141c]"
                >
                  <Link to={`/product/${product.slug}`}>
                    <img
                      src={product.image}
                      alt=""
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${product.slug}`}
                      className="font-medium hover:text-violet-300 line-clamp-2"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-1">{product.brand}</p>
                    {Object.keys(item.selectedVariants).length > 0 && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {Object.entries(item.selectedVariants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </p>
                    )}
                    <p className="text-violet-300 font-semibold mt-2">
                      {formatPrice(item.unitPrice)}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-white/10 rounded-lg">
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center"
                          onClick={() => updateCartQty(item.productId, vk, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center"
                          onClick={() => updateCartQty(item.productId, vk, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId, vk)}
                        className="text-zinc-500 hover:text-red-400 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="font-semibold hidden sm:block">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-zinc-500 hover:text-red-400"
            >
              Clear cart
            </button>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#12141c] p-6 h-fit sticky top-28">
            <h2 className="font-semibold text-lg mb-4">Order summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Delivery</span>
                <span>{formatPrice(delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-white/10">
                <span>Estimated total (West Bank)</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              Payment: Cash on Delivery (COD)
            </p>
            <Link
              to="/checkout"
              className="mt-4 block w-full text-center py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold hover:opacity-90"
            >
              Proceed to checkout
            </Link>
            <Link
              to="/shop"
              className="mt-2 block w-full text-center py-2.5 text-sm text-zinc-400 hover:text-white"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
