import { useMemo, useState } from 'react';
import { Check, Trash2, Truck, PackageCheck, XCircle, Mail } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../lib/utils';
import { buildOrderMailto, buildWhatsAppOrderLink } from '../../lib/storage';
import type { Order, OrderStatus } from '../../lib/types';

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, storeInfo } = useStore();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);

  const list = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const setStatus = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const remove = (o: Order) => {
    if (confirm(`Delete order ${o.code}? This cannot be undone.`)) {
      deleteOrder(o.id);
      if (selected?.id === o.id) setSelected(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-zinc-500">{orders.length} total · manage, approve or delete</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-2">
          {list.length === 0 && (
            <p className="text-zinc-500 text-sm p-8 text-center border border-dashed border-white/10 rounded-2xl">
              No orders in this filter
            </p>
          )}
          {list.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o)}
              className={`w-full text-left p-4 rounded-xl border transition ${
                selected?.id === o.id
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/8 bg-[#12141c] hover:border-white/15'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono font-bold text-violet-300">{o.code}</span>
                  <span className="ml-2 text-sm">{o.customerName}</span>
                  <p className="text-xs text-zinc-500 mt-1">
                    {o.deliveryRegion ? `${o.deliveryRegion} · ` : ''}{o.city} · {new Date(o.createdAt).toLocaleString()} · {o.items.length} item(s)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold">{formatPrice(o.total)}</div>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-2xl border border-white/8 bg-[#12141c] p-5 sticky top-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-xl font-bold text-violet-300">{selected.code}</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <div className="text-sm space-y-1">
                <p>
                  <span className="text-zinc-500">Customer:</span> {selected.customerName}
                </p>
                <p>
                  <span className="text-zinc-500">Phone:</span>{' '}
                  <a href={`tel:${selected.customerPhone}`} className="text-violet-300">
                    {selected.customerPhone}
                  </a>
                </p>
                <p>
                  <span className="text-zinc-500">General area:</span> {selected.deliveryRegion ?? 'Not specified (older order)'}
                </p>
                <p>
                  <span className="text-zinc-500">City:</span> {selected.city}
                </p>
                <p>
                  <span className="text-zinc-500">Address:</span> {selected.address}
                </p>
                {selected.notes && (
                  <p>
                    <span className="text-zinc-500">Notes:</span> {selected.notes}
                  </p>
                )}
                <p>
                  <span className="text-zinc-500">Payment:</span> Cash on Delivery
                </p>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm gap-2">
                    <span className="text-zinc-300 line-clamp-2">
                      {item.title} ×{item.quantity}
                      {Object.keys(item.selectedVariants).length > 0 && (
                        <span className="block text-[11px] text-zinc-500">
                          {Object.entries(item.selectedVariants)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm text-zinc-400 pt-2">
                  <span>Delivery</span>
                  <span>{selected.deliveryFee === 0 ? 'FREE' : formatPrice(selected.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(selected.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <ActionBtn
                  onClick={() => setStatus(selected.id, 'approved')}
                  icon={Check}
                  label="Approve"
                  className="bg-sky-600/20 text-sky-300 border-sky-500/30"
                />
                <ActionBtn
                  onClick={() => setStatus(selected.id, 'shipped')}
                  icon={Truck}
                  label="Shipped"
                  className="bg-violet-600/20 text-violet-300 border-violet-500/30"
                />
                <ActionBtn
                  onClick={() => setStatus(selected.id, 'delivered')}
                  icon={PackageCheck}
                  label="Delivered"
                  className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30"
                />
                <ActionBtn
                  onClick={() => setStatus(selected.id, 'cancelled')}
                  icon={XCircle}
                  label="Cancel"
                  className="bg-amber-600/20 text-amber-300 border-amber-500/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={buildOrderMailto(selected)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5"
                >
                  <Mail className="w-4 h-4" /> Email to {storeInfo.email}
                </a>
                <a
                  href={buildWhatsAppOrderLink(selected)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-sm"
                >
                  WhatsApp customer
                </a>
                <button
                  type="button"
                  onClick={() => remove(selected)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/15 border border-red-500/30 text-red-400 text-sm hover:bg-red-600/25"
                >
                  <Trash2 className="w-4 h-4" /> Delete order
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500 text-sm">
              Select an order to view details and approve or delete
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400',
    approved: 'bg-sky-500/15 text-sky-400',
    shipped: 'bg-violet-500/15 text-violet-400',
    delivered: 'bg-emerald-500/15 text-emerald-400',
    cancelled: 'bg-red-500/15 text-red-400',
    deleted: 'bg-zinc-500/15 text-zinc-400',
  };
  return (
    <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status]}`}>
      {status}
    </span>
  );
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  className,
}: {
  onClick: () => void;
  icon: typeof Check;
  label: string;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold ${className}`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}
