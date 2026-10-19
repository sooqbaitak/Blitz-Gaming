import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  X,
  ChevronDown,
  MapPin,
  Phone,
  Truck,
  ShieldCheck,
  Banknote,
  CircleUserRound,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { categories } from '../lib/categories';
import { formatPrice } from '../lib/utils';

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { cartCount, cartSubtotal, favorites, storeInfo, siteSettings, language, setLanguage } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-[#0d1118] border-b border-white/5 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {storeInfo.location}, Palestine
            </span>
            <a
              href={`https://wa.me/${storeInfo.whatsappDigits}`}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition"
              target="_blank"
              rel="noreferrer"
            >
              <Phone className="w-3.5 h-3.5" />
              {storeInfo.whatsapp}
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" /> Delivery areas available at checkout
            </span>
            <span className="flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-amber-400" /> Cash on delivery
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Genuine products
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5" title="Preferred language">
              <span className="sr-only">Preferred language</span>
              <select aria-label="Preferred language" value={language} onChange={(e) => setLanguage(e.target.value as 'English' | 'Arabic' | 'Hebrew')} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500">
                <option value="English">English</option><option value="Arabic">العربية</option><option value="Hebrew">עברית</option>
              </select>
            </label>
            <Link to="/track" className="hover:text-white transition">
              Track order
            </Link>
            <Link to="/support" className="hover:text-white transition">
              Support
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-[#0a0b0f]/90 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2 shrink-0">
            {siteSettings.logoUrl ? (
              <img src={siteSettings.logoUrl} alt={`${siteSettings.storeName} logo`} className="w-10 h-10 rounded-xl object-contain bg-white/5" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-400 flex items-center justify-center font-black text-sm shadow-lg shadow-violet-500/30">BG</div>
            )}
            <div className="leading-tight">
              <div className="font-bold text-lg tracking-tight">{siteSettings.storeName}</div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">{siteSettings.tagline}</div>
            </div>
          </Link>

          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the store..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 placeholder:text-zinc-600"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            <Link
              to="/account"
              className="p-2.5 rounded-xl hover:bg-white/5 transition"
              aria-label="Your account"
              title="Your account"
            >
              <CircleUserRound className="w-5 h-5" />
            </Link>
            <Link
              to="/favorites"
              className="relative p-2.5 rounded-xl hover:bg-white/5 transition"
              aria-label="Favorites"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-fuchsia-500 text-[10px] flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 p-2.5 rounded-xl hover:bg-white/5 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-violet-500 text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
              <span className="hidden sm:block text-sm text-zinc-400">
                {cartCount > 0 ? formatPrice(cartSubtotal) : 'Cart'}
              </span>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden lg:block border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1 relative">
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 text-violet-300"
              >
                All categories <ChevronDown className="w-4 h-4" />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full pt-1 w-[640px] z-50">
                  <div className="bg-[#12141c] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-4 grid grid-cols-2 gap-4">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          to={`/category/${cat.slug}`}
                          className="font-semibold text-sm text-white hover:text-violet-300"
                          onClick={() => setCatOpen(false)}
                        >
                          {cat.name}
                        </Link>
                        <ul className="mt-2 space-y-1">
                          {cat.children?.map((ch) => (
                            <li key={ch.id}>
                              <Link
                                to={`/category/${ch.slug}`}
                                className="text-xs text-zinc-400 hover:text-white block py-0.5"
                                onClick={() => setCatOpen(false)}
                              >
                                {ch.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {[
              { to: '/shop', label: 'Shop' },
              { to: '/build', label: 'Build your PC' },
              { to: '/category/processors', label: 'Processors' },
              { to: '/category/graphics-cards', label: 'Graphics cards' },
              { to: '/category/monitors', label: 'Monitors' },
              { to: '/category/gaming-accessories', label: 'Accessories' },
              { to: '/offers', label: 'Offers' },
              { to: '/brands', label: 'Brands' },
            ].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm rounded-lg transition ${
                    isActive ? 'text-white bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#0d1118] border-r border-white/10 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg">Menu</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm"
              />
            </form>
            <div className="space-y-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'All products' },
                { to: '/build', label: 'Build your PC' },
                { to: '/offers', label: 'Offers' },
                { to: '/brands', label: 'Brands' },
                { to: '/track', label: 'Track order' },
                { to: '/account', label: 'My account' },
                { to: '/cart', label: 'Cart' },
                { to: '/support', label: 'Support' },
                { to: '/about', label: 'About us' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Categories</p>
              {categories.map((cat) => (
                <div key={cat.id} className="mb-3">
                  <Link
                    to={`/category/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="font-medium text-sm text-violet-300"
                  >
                    {cat.name}
                  </Link>
                  <div className="ml-2 mt-1 space-y-0.5">
                    {cat.children?.map((ch) => (
                      <Link
                        key={ch.id}
                        to={`/category/${ch.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block text-xs text-zinc-400 py-1"
                      >
                        {ch.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
