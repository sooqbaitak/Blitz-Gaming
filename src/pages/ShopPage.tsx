import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductGrid } from '../components/ProductGrid';
import { flattenCategories, brands } from '../lib/categories';

export function ShopPage() {
  const { products } = useStore();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const brand = params.get('brand') ?? '';
  const cat = params.get('cat') ?? '';
  const [sort, setSort] = useState('featured');
  const [stockOnly, setStockOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(qq) ||
          p.brand.toLowerCase().includes(qq) ||
          p.tags.some((t) => t.includes(qq)) ||
          p.description.toLowerCase().includes(qq),
      );
    }
    if (brand) list = list.filter((p) => p.brand.toLowerCase().includes(brand.toLowerCase()));
    if (cat)
      list = list.filter(
        (p) => p.category === cat || p.subcategory === cat,
      );
    if (stockOnly) list = list.filter((p) => p.stock === 'in_stock');
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return list;
  }, [products, q, brand, cat, sort, stockOnly]);

  const cats = flattenCategories().filter((c) => !c.children || c.children.length === 0 || ['processors','graphics-cards','motherboards','memory','storage','pc-cases','power-supplies','air-coolers','aio-liquid-cooling','case-fans','mice','keyboards','headsets','monitors','gaming-chairs','gaming-pcs'].includes(c.slug));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {q ? `Search: “${q}”` : brand ? `Brand: ${brand}` : 'All products'}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">{filtered.length} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0 space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Category</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  const n = new URLSearchParams(params);
                  n.delete('cat');
                  setParams(n);
                }}
                className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg ${!cat ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/5 text-zinc-400'}`}
              >
                All
              </button>
              {cats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    const n = new URLSearchParams(params);
                    n.set('cat', c.slug);
                    setParams(n);
                  }}
                  className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg ${cat === c.slug ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/5 text-zinc-400'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Brand</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  const n = new URLSearchParams(params);
                  n.delete('brand');
                  setParams(n);
                }}
                className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg ${!brand ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/5 text-zinc-400'}`}
              >
                All brands
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    const n = new URLSearchParams(params);
                    n.set('brand', b);
                    setParams(n);
                  }}
                  className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg ${brand === b ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/5 text-zinc-400'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
              className="rounded border-white/20"
            />
            In stock only
          </label>
        </aside>

        <div className="flex-1">
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <ProductGrid products={filtered} />
        </div>
      </div>
    </div>
  );
}
