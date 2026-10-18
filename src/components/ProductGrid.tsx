import type { Product } from '../lib/types';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, empty }: { products: Product[]; empty?: string }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        {empty ?? 'No products found in this category.'}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
