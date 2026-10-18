import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';
import { ShoppingCart } from 'lucide-react';

const SLOTS = [
  { key: 'cpu', label: 'Processor', categories: ['processors'] },
  { key: 'mb', label: 'Motherboard', categories: ['motherboards'] },
  { key: 'ram', label: 'Memory', categories: ['memory'] },
  { key: 'gpu', label: 'Graphics card', categories: ['graphics-cards'] },
  { key: 'storage', label: 'Storage', categories: ['storage', 'ssd-nvme', 'ssd-sata'] },
  { key: 'case', label: 'PC case', categories: ['pc-cases'] },
  { key: 'psu', label: 'Power supply', categories: ['power-supplies'] },
  { key: 'cooler', label: 'Cooling', categories: ['air-coolers', 'aio-liquid-cooling'] },
] as const;

type SlotKey = (typeof SLOTS)[number]['key'];

export function BuildPCPage() {
  const { products, addToCart } = useStore();
  const [selected, setSelected] = useState<Partial<Record<SlotKey, string>>>({});
  const [activeSlot, setActiveSlot] = useState<SlotKey>('cpu');

  const activeDef = SLOTS.find((s) => s.key === activeSlot)!;
  const options = useMemo(
    () =>
      products.filter(
        (p) =>
          activeDef.categories.includes(p.category as never) ||
          (p.subcategory && activeDef.categories.includes(p.subcategory as never)),
      ),
    [products, activeDef],
  );

  const total = SLOTS.reduce((sum, slot) => {
    const id = selected[slot.key];
    const p = products.find((x) => x.id === id);
    return sum + (p?.price ?? 0);
  }, 0);

  const addAll = () => {
    Object.values(selected).forEach((id) => {
      if (id) addToCart(id, 1, {});
    });
  };

  const count = Object.values(selected).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Build your PC</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Pick components slot by slot. We&apos;ll total your build — then add everything to cart.
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          {SLOTS.map((slot) => {
            const p = products.find((x) => x.id === selected[slot.key]);
            return (
              <button
                key={slot.key}
                type="button"
                onClick={() => setActiveSlot(slot.key)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  activeSlot === slot.key
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-white/8 bg-[#12141c] hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{slot.label}</p>
                    <p className="text-sm font-medium mt-1 line-clamp-1">
                      {p ? p.title : 'Not selected'}
                    </p>
                  </div>
                  {p && <span className="text-sm text-violet-300 shrink-0">{formatPrice(p.price)}</span>}
                </div>
              </button>
            );
          })}
          <div className="p-4 rounded-xl border border-white/8 bg-[#12141c] mt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Build total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">{count} / {SLOTS.length} parts selected</p>
            <button
              type="button"
              disabled={count === 0}
              onClick={addAll}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <ShoppingCart className="w-4 h-4" /> Add build to cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-semibold mb-4">Choose {activeDef.label}</h2>
          <div className="grid sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            {options.map((p) => {
              const isSel = selected[activeSlot] === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setSelected((s) => ({
                      ...s,
                      [activeSlot]: isSel ? undefined : p.id,
                    }))
                  }
                  className={`flex gap-3 p-3 rounded-xl border text-left transition ${
                    isSel
                      ? 'border-violet-500 bg-violet-500/15'
                      : 'border-white/8 bg-[#12141c] hover:border-white/20'
                  }`}
                >
                  <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-2">{p.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{p.brand}</p>
                    <p className="text-violet-300 font-semibold text-sm mt-1">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                </button>
              );
            })}
            {options.length === 0 && (
              <p className="text-zinc-500 col-span-2">
                No products in this slot.{' '}
                <Link to="/shop" className="text-violet-400">
                  Browse shop
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
