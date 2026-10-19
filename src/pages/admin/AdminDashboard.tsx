import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../lib/utils';

export function AdminDashboard() {
  const { products, orders } = useStore();
  const pending = orders.filter((o) => o.status === 'pending');
  // Cash-on-delivery sales are counted as revenue only after delivery is completed.
  const revenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + o.total, 0);
  const inStock = products.filter((p) => p.stock === 'in_stock').length;

  const cards = [
    { label: 'Products', value: products.length, sub: `${inStock} in stock`, icon: Package, to: '/admin/products' },
    { label: 'Orders', value: orders.length, sub: `${pending.length} pending`, icon: ShoppingBag, to: '/admin/orders' },
    { label: 'Pending', value: pending.length, sub: 'Awaiting approval', icon: Clock, to: '/admin/orders' },
    { label: 'Completed sales', value: formatPrice(revenue), sub: 'Delivered orders only', icon: CheckCircle, to: '/admin/orders' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard overview</h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="p-5 rounded-2xl border border-white/8 bg-[#12141c] hover:border-violet-500/30 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{c.label}</span>
              <c.icon className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{c.sub}</div>
          </Link>
        ))}
      </div>

      <h2 className="font-semibold mb-4">Recent pending orders</h2>
      {pending.length === 0 ? (
        <p className="text-zinc-500 text-sm">No pending orders</p>
      ) : (
        <div className="space-y-2">
          {pending.slice(0, 5).map((o) => (
            <Link
              key={o.id}
              to="/admin/orders"
              className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-[#12141c] hover:border-white/15"
            >
              <div>
                <span className="font-mono font-bold text-violet-300">{o.code}</span>
                <span className="text-sm text-zinc-400 ml-3">{o.customerName}</span>
              </div>
              <div className="text-sm font-semibold">{formatPrice(o.total)}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/products?new=1"
          className="px-5 py-2.5 rounded-xl bg-violet-600 font-medium text-sm hover:bg-violet-500"
        >
          + Add product
        </Link>
        <Link
          to="/admin/orders"
          className="px-5 py-2.5 rounded-xl border border-white/10 text-sm hover:bg-white/5"
        >
          Manage orders
        </Link>
      </div>
    </div>
  );
}
