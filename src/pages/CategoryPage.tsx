import { Link, useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { findCategory, flattenCategories } from '../lib/categories';
import { ProductGrid } from '../components/ProductGrid';

const PARENT_MAP: Record<string, string[]> = {
  'pc-components': ['graphics-cards', 'processors', 'motherboards', 'memory', 'storage', 'ssd-nvme', 'ssd-sata', 'hdd', 'storage-accessories', 'intel-motherboards', 'amd-motherboards'],
  'cases-cooling': ['pc-cases', 'power-supplies', 'air-coolers', 'aio-liquid-cooling', 'case-fans', 'thermal-paste', 'cooling-accessories', 'gamemax-cases', 'xeron-cases'],
  'gaming-accessories': ['mice', 'keyboards', 'headsets', 'mouse-pads', 'monitors'],
  'ready-made-pcs': ['gaming-pcs', 'office-pcs'],
  'furniture-room-setup': ['gaming-chairs', 'gaming-desks'],
  motherboards: ['motherboards', 'intel-motherboards', 'amd-motherboards'],
  storage: ['storage', 'ssd-nvme', 'ssd-sata', 'hdd', 'storage-accessories'],
  'pc-cases': ['pc-cases', 'gamemax-cases', 'xeron-cases'],
};

export function CategoryPage() {
  const { slug = '' } = useParams();
  const { products } = useStore();
  const category = findCategory(slug);

  const related = PARENT_MAP[slug] ?? [slug];
  const filtered = products.filter(
    (p) =>
      related.includes(p.category) ||
      (p.subcategory && related.includes(p.subcategory)) ||
      p.category === slug ||
      p.subcategory === slug,
  );

  const children = category?.children ?? [];
  const all = flattenCategories();
  const parent = all.find((c) => c.children?.some((ch) => ch.slug === slug));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-xs text-zinc-500 mb-4 flex gap-2 flex-wrap">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        {parent && (
          <>
            <Link to={`/category/${parent.slug}`} className="hover:text-white">{parent.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-300">{category?.name ?? slug}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        {category?.name ?? slug.replace(/-/g, ' ')}
      </h1>
      <p className="text-zinc-400 text-sm mb-8">{filtered.length} products</p>

      {children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {children.map((ch) => (
            <Link
              key={ch.id}
              to={`/category/${ch.slug}`}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm hover:border-violet-500/40 transition"
            >
              {ch.name}
            </Link>
          ))}
        </div>
      )}

      <ProductGrid products={filtered} />
    </div>
  );
}
