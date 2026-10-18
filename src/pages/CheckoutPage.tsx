import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice, calcDeliveryFee } from '../lib/utils';
import { buildWhatsAppOrderLink } from '../lib/storage';
import type { DeliveryRegion, Order } from '../lib/types';

const CITIES = [
  'Hebron',
  'Bethlehem',
  'Ramallah',
  'Nablus',
  'Jenin',
  'Tulkarm',
  'Qalqilya',
  'Jericho',
  'Jerusalem',
  'Other',
];

export function CheckoutPage() {
  const { cart, products, cartSubtotal, placeOrder, variantsKey, storeInfo } = useStore();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryRegion: 'West Bank' as DeliveryRegion,
    city: 'Hebron',
    address: '',
    notes: '',
  });

  const delivery = calcDeliveryFee(cartSubtotal);
  const total = cartSubtotal + delivery;

  if (cart.length === 0 && !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-400 mb-4">Your cart is empty</p>
        <Link to="/shop" className="text-violet-400 hover:underline">
          Go shopping
        </Link>
      </div>
    );
  }

  if (order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Order placed successfully!</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Save your order code to track or inquire about your order.
          </p>
          <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/10">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Your order code</p>
            <p className="text-3xl font-black tracking-widest text-violet-300 mt-1 font-mono">
              {order.code}
            </p>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            Total: <strong className="text-white">{formatPrice(order.total)}</strong> · Cash on
            Delivery
          </p>
          <p className="mt-2 text-xs text-zinc-500">Delivery area: {order.deliveryRegion}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Order details are prepared for store notification. Please use WhatsApp below if you want
            to confirm directly with us.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href={buildWhatsAppOrderLink(order)}
              target="_blank"
              rel="noreferrer"
              className="py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:opacity-90"
            >
              Confirm via WhatsApp
            </a>
            <Link
              to={`/track?code=${order.code}`}
              className="py-3 rounded-xl border border-white/15 font-medium hover:bg-white/5"
            >
              Track this order
            </Link>
            <Link to="/" className="text-sm text-zinc-500 hover:text-white py-2">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.address.trim()) {
      setError('Please fill in name, phone and address.');
      return;
    }
    const phoneDigits = form.customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      setError('Please enter a valid phone number.');
      return;
    }
    const created = placeOrder(form);
    setOrder(created);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-8">
        <form onSubmit={submit} className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl border border-white/8 bg-[#12141c] p-6 space-y-4">
            <h2 className="font-semibold text-lg">Delivery details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500">Full name *</label>
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Phone *</label>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
                  placeholder="+970 5X XXX XXXX"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500">General area *</label>
              <select
                required
                value={form.deliveryRegion}
                onChange={(e) => setForm({ ...form, deliveryRegion: e.target.value as DeliveryRegion })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
              >
                <option value="West Bank">West Bank</option>
                <option value="Jerusalem">Jerusalem</option>
                <option value="1948 Areas">1948 Areas</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500">City *</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500">Full address *</label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 resize-none"
                placeholder="Street, building, floor, landmark..."
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Order notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 resize-none"
                placeholder="Optional notes for delivery"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex gap-3">
            <Banknote className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-200">Cash on Delivery</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Pay when you receive your order. No advance payment required. Orders are notified to{' '}
                {storeInfo.email}.
              </p>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold text-lg hover:opacity-90 transition"
          >
            Place order — {formatPrice(total)}
          </button>
        </form>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/8 bg-[#12141c] p-6 sticky top-28">
            <h2 className="font-semibold mb-4">Your order</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((item) => {
                const p = products.find((x) => x.id === item.productId);
                if (!p) return null;
                return (
                  <div key={`${item.productId}-${variantsKey(item.selectedVariants)}`} className="flex gap-3 text-sm">
                    <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 text-zinc-300">{p.title}</p>
                      <p className="text-zinc-500 text-xs">×{item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Delivery</span>
                <span>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="mt-4 text-xs text-zinc-500 hover:text-white"
            >
              ← Edit cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
