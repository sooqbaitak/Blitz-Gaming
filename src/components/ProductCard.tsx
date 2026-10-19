import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../lib/types';
import { formatPrice } from '../lib/utils';
import { useStore } from '../context/StoreContext';

export function ProductCard({
  product,
  onAdded,
}: {
  product: Product;
  onAdded?: () => void;
}) {
  const { addToCart, toggleFavorite, favorites } = useStore();
  const fav = favorites.includes(product.id);
  const out = product.stock === 'out_of_stock';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (out) return;
    const defaults: Record<string, string> = {};
    product.variants.forEach((v) => {
      if (v.options[0]) defaults[v.name] = v.options[0];
    });
    addToCart(product.id, 1, defaults);
    onAdded?.();
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative flex flex-col bg-[#12141c] border border-white/8 rounded-2xl overflow-hidden hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-900/10 transition"
    >
      {product.label && (
        <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
          {product.label}
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60"
        aria-label="Favorite"
      >
        <Heart className={`w-4 h-4 ${fav ? 'fill-fuchsia-500 text-fuchsia-500' : 'text-white'}`} />
      </button>

      <div className="aspect-square bg-[#0d0f14] overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
          {product.brand}
        </span>
        <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-violet-300 transition min-h-[2.5rem]">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{product.ratingCount ? (product.rating ?? 0).toFixed(1) : '—'}</span>
          <span>({product.ratingCount ?? 0})</span>
          {(product.loyaltyPoints ?? 0) > 0 && <span className="ml-2 text-amber-300">+{product.loyaltyPoints} pts</span>}
        </div>
        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-white">{formatPrice(product.price)}</div>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div className="text-xs text-zinc-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </div>
            )}
            <div
              className={`text-[11px] mt-0.5 font-medium ${
                out ? 'text-red-400' : product.stock === 'preorder' ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {out ? 'Out of stock' : product.stock === 'preorder' ? 'Pre-order' : 'In stock'}
            </div>
          </div>
          <button
            type="button"
            disabled={out}
            onClick={handleAdd}
            className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed flex items-center justify-center transition shrink-0"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
