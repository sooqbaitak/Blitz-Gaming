import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Settings,
  Store,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function AdminLayout() {
  const { isAdmin, logoutAdmin, orders, products } = useStore();

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const pending = orders.filter((o) => o.status === 'pending').length;

  const nav = [
    { to: '/admin', end: true, icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/orders', icon: ShoppingBag, label: `Orders${pending ? ` (${pending})` : ''}` },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex">
      <aside className="w-60 border-r border-white/8 bg-[#0d1118] flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center font-black text-xs">
              BG
            </div>
            <div>
              <div className="font-bold text-sm">Blitz Admin</div>
              <div className="text-[10px] text-zinc-500">{products.length} products</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <n.icon className="w-4 h-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/8 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-white/5"
          >
            <Store className="w-4 h-4" /> View store
          </Link>
          <button
            type="button"
            onClick={logoutAdmin}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-2 p-3 border-b border-white/8 overflow-x-auto bg-[#0d1118]">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                  isActive ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
          <button type="button" onClick={logoutAdmin} className="px-3 py-1.5 text-xs text-red-400">
            Logout
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
