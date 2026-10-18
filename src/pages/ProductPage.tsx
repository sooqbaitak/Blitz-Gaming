import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingCart, MessageCircle, Truck, Shield, Banknote } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../lib/utils';
import { ProductGrid } from '../components/ProductGrid';
import { findCategory } from '../lib/categories';

export function ProductPage() {
  const { slug = '' } = useParams();
  const { getProduct, addToCart, toggleFavorite, favorites, products, storeInfo } = useStore();
  const product = getProduct(slug);
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const defaults = useMemo(() => {
    if (!product) return {};
    const d: Record<string, string> = {};
    product.variants.forEach((v) => {
      if (v.options[0]) d[v.name] = selected[v.name] ?? v.options[0];
    });
    return d;
  }, [product, selected]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/shop" className="text-violet-400 mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const fav = favorites.includes(product.id);
  const out = product.stock === 'out_of_stock';
  const cat = findCategory(product.category);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    if (out) return;
    addToCart(product.id, qty, defaults);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const waText = encodeURIComponent(
    `Hi Blitz Gaming! I'm asking about: ${product.title} (${formatPrice(product.price)})`,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-xs text-zinc-500 mb-6 flex gap-2 flex-wrap">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        {cat && (
          <>
            <Link to={`/category/${cat.slug}`} className="hover:text-white">{cat.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-300 line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="rounded-3xl overflow-hidden border border-white/8 bg-[#12141c] aspect-square">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
        </div>

        <div>
          <p className="text-sm text-violet-400 font-medium uppercase tracking-wider">{product.brand}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2 leading-tight">{product.title}</h1>

          {product.label && (
            <span className="inline-block mt-3 px-2.5 py-1 rounded-md text-xs font-bold bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/30">
              {product.label}
            </span>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-black">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-zinc-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p
            className={`mt-2 text-sm font-medium ${
              out ? 'text-red-400' : product.stock === 'preorder' ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {out ? 'Out of stock' : product.stock === 'preorder' ? 'Available for pre-order' : 'In stock — ready to ship'}
          </p>

          <p className="mt-5 text-zinc-400 text-sm leading-relaxed">{product.description}</p>

          {product.variants.map((v) => (
            <div key={v.id} className="mt-6">
              <label className="text-sm font-medium text-zinc-300">
                {v.name}
                {defaults[v.name] && (
                  <span className="text-zinc-500 font-normal"> — {defaults[v.name]}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelected((s) => ({ ...s, [v.name]: opt }))}
                    className={`px-4 py-2 rounded-xl text-sm border transition ${
                      defaults[v.name] === opt
                        ? 'border-violet-500 bg-violet-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/30'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold mb-3">Specifications</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <dt className="text-zinc-500 text-xs">{k}</dt>
                    <dd className="text-zinc-200">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                className="w-11 h-11 flex items-center justify-center hover:bg-white/5"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{qty}</span>
              <button
                type="button"
                className="w-11 h-11 flex items-center justify-center hover:bg-white/5"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={out}
              onClick={handleAdd}
              className="flex-1 min-w-[160px] h-11 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              {added ? 'Added!' : 'Add to cart'}
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5"
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-fuchsia-500 text-fuchsia-500' : ''}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              handleAdd();
              navigate('/checkout');
            }}
            disabled={out}
            className="mt-3 w-full h-11 rounded-xl border border-white/15 font-medium hover:bg-white/5 disabled:opacity-40 transition"
          >
            Buy now — Cash on Delivery
          </button>

          <a
            href={`https://wa.me/${storeInfo.whatsappDigits}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 w-full h-11 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-medium flex items-center justify-center gap-2 hover:bg-[#25D366]/25 transition"
          >
            <MessageCircle className="w-4 h-4" /> Ask about availability
          </a>

          <div className="mt-8 grid sm:grid-cols-3 gap-3 text-xs text-zinc-400">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
              Cash on delivery — no advance payment
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
              Delivery areas selected at checkout
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              Genuine products with warranty
            </div>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <Link
                  key={t}
                  to={`/shop?q=${encodeURIComponent(t)}`}
                  className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] text-zinc-400 hover:text-white"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related products</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
