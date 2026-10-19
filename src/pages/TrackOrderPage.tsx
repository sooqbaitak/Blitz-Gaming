import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';
import type { Order } from '../lib/types';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending review', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  approved: { label: 'Approved', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  shipped: { label: 'Shipped', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  delivered: { label: 'Delivered', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  deleted: { label: 'Removed', color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/30' },
};

export function TrackOrderPage() {
  const [params] = useSearchParams();
  const { findOrderByCode, storeInfo } = useStore();
  const [code, setCode] = useState(params.get('code') ?? '');
  const [result, setResult] = useState<Order | null | undefined>(
    params.get('code') ? findOrderByCode(params.get('code')!) : undefined,
  );
  const [searched, setSearched] = useState(!!params.get('code'));

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setResult(findOrderByCode(code));
  };

  const st = result ? STATUS_LABEL[result.status] : null;

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <Package className="w-12 h-12 text-violet-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Track your order</h1>
        <p className="text-zinc-400 text-sm mt-2">
          Enter the order code you received (starts with BG).
        </p>
      </div>

      <form onSubmit={search} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. BG001001"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono tracking-wider focus:outline-none focus:border-violet-500/50"
        />
        <button
          type="submit"
          className="px-5 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold flex items-center gap-2"
        >
          <Search className="w-4 h-4" /> Track
        </button>
      </form>

      {searched && !result && (
        <div className="mt-8 text-center p-6 rounded-2xl border border-white/8 bg-[#12141c] text-zinc-400">
          No order found with code <span className="font-mono text-white">{code}</span>.
          <p className="text-xs mt-2">
            Contact us on WhatsApp {storeInfo.whatsapp} if you need help.
          </p>
        </div>
      )}

      {result && st && (
        <div className="mt-8 rounded-2xl border border-white/8 bg-[#12141c] p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500">Order code</p>
              <p className="text-2xl font-mono font-bold text-violet-300">{result.code}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
              {st.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-500">Customer</p>
              <p>{result.customerName}</p>
            </div>

            <div>
              <p className="text-xs text-zinc-500">City / delivery area</p>
              <p>{result.city}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Date</p>
              <p>{new Date(result.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Payment</p>
              <p>Cash on Delivery</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 space-y-2">
            {result.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-zinc-300">
                  {item.title} ×{item.quantity}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold border-t border-white/10 pt-3">
            <span>Total</span>
            <span>{formatPrice(result.total)}</span>
          </div>
          <a
            href={`https://wa.me/${storeInfo.whatsappDigits}?text=${encodeURIComponent(`Hi, I want to inquire about order ${result.code}`)}`}
            target="_blank"
            rel="noreferrer"
            className="block text-center py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-sm font-medium"
          >
            Inquire via WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
