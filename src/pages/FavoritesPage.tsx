import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductGrid } from '../components/ProductGrid';

export function FavoritesPage() {
  const { products, favorites } = useStore();
  const list = products.filter((p) => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Favorites</h1>
      <p className="text-zinc-400 text-sm mb-8">{list.length} saved products</p>
      {list.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/8 bg-[#12141c]">
          <p className="text-zinc-400">No favorites yet</p>
          <Link to="/shop" className="inline-block mt-4 text-violet-400 hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <ProductGrid products={list} />
      )}
    </div>
  );
}
