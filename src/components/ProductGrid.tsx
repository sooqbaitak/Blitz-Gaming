import type { Product } from '../lib/types';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, empty, columns = 4 }: { products: Product[]; empty?: string; columns?: number }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        {empty ?? 'No products found in this category.'}
      </div>
    );
  }
  return (
    <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5" style={{ '--product-grid-columns': Math.min(4, Math.max(2, columns)) } as React.CSSProperties}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
