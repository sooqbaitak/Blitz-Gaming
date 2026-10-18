import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import type { Product, ProductVariant, StockStatus } from '../../lib/types';
import { flattenCategories } from '../../lib/categories';
import { formatPrice, uid } from '../../lib/utils';
import { getProductImageFallback } from '../../lib/products';

const emptyForm = (): FormState => ({
  title: '',
  price: '',
  compareAtPrice: '',
  description: '',
  brand: '',
  tags: '',
  category: 'processors',
  subcategory: '',
  label: '',
  stock: 'in_stock',
  image: '',
  featured: false,
  variantName: 'Colour',
  variantType: 'color',
  variantOptions: '',
});

interface FormState {
  title: string;
  price: string;
  compareAtPrice: string;
  description: string;
  brand: string;
  tags: string;
  category: string;
  subcategory: string;
  label: string;
  stock: StockStatus;
  image: string;
  featured: boolean;
  variantName: string;
  variantType: 'color' | 'size' | 'other';
  variantOptions: string;
}

function productToForm(p: Product): FormState {
  const v = p.variants[0];
  return {
    title: p.title,
    price: String(p.price),
    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
    description: p.description,
    brand: p.brand,
    tags: p.tags.join(', '),
    category: p.category,
    subcategory: p.subcategory ?? '',
    label: p.label ?? '',
    stock: p.stock,
    image: p.image,
    featured: !!p.featured,
    variantName: v?.name ?? 'Colour',
    variantType: v?.type ?? 'color',
    variantOptions: v?.options.join(', ') ?? '',
  };
}

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [query, setQuery] = useState('');
  const cats = flattenCategories();

  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(null);
      setForm(emptyForm());
      setOpen(true);
      const n = new URLSearchParams(params);
      n.delete('new');
      setParams(n, { replace: true });
    }
  }, [params, setParams]);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.includes(q),
    );
  }, [products, query]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm(productToForm(p));
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.title.trim() || isNaN(price) || price < 0) return;

    const variants: ProductVariant[] = [];
    if (form.variantOptions.trim()) {
      variants.push({
        id: editing?.variants[0]?.id ?? uid('var'),
        name: form.variantName.trim() || 'Option',
        type: form.variantType,
        options: form.variantOptions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
    }
    // The form edits the first variant; retain any additional variants already on this product.
    if (editing && editing.variants.length > 1) variants.push(...editing.variants.slice(1));

    const payload = {
      title: form.title.trim(),
      price,
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
      description: form.description.trim() || `${form.title} — Blitz Gaming`,
      brand: form.brand.trim() || 'Generic',
      tags: form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      category: form.category,
      subcategory: form.subcategory || undefined,
      label: form.label.trim() || undefined,
      stock: form.stock,
      image: form.image.trim() || getProductImageFallback(form.category),
      featured: form.featured,
      variants,
    };

    if (editing) {
      updateProduct(editing.id, payload);
    } else {
      addProduct(payload);
    }
    setOpen(false);
    setEditing(null);
    setForm(emptyForm());
  };

  const handleDelete = (p: Product) => {
    if (confirm(`Delete "${p.title}"?`)) deleteProduct(p.id);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-zinc-500">{products.length} total</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 font-medium text-sm hover:bg-violet-500"
        >
          <Plus className="w-4 h-4" /> Add product
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="mb-4 w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm"
      />

      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-zinc-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Price</th>
                <th className="text-left p-3 font-medium">Stock</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <div className="font-medium line-clamp-1">{p.title}</div>
                        <div className="text-xs text-zinc-500">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-zinc-400">{p.category}</td>
                  <td className="p-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.stock === 'in_stock'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : p.stock === 'preorder'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {p.stock.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="p-2 rounded-lg hover:bg-white/10 inline-flex"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 inline-flex"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={save}
            className="w-full max-w-2xl my-8 rounded-3xl border border-white/10 bg-[#12141c] shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h2 className="font-bold text-lg">{editing ? 'Edit product' : 'Add product'}</h2>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <Field label="Title *" className="sm:col-span-2">
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="Product title"
                />
              </Field>
              <Field label="Price (₪) *">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Compare-at price">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="input"
                  placeholder="Optional"
                />
              </Field>
              <Field label="Brand *">
                <input
                  required
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Label">
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="input"
                  placeholder="New, Sale, Popular..."
                />
              </Field>
              <Field label="Category *">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Subcategory">
                <input
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  className="input"
                  placeholder="e.g. intel-processors"
                />
              </Field>
              <Field label="Stock status">
                <select
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value as StockStatus })}
                  className="input"
                >
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="preorder">Pre-order</option>
                </select>
              </Field>
              <Field label="Tags (comma-separated)" className="sm:col-span-2">
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="input"
                  placeholder="gaming, rgb, wireless"
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input min-h-[80px] resize-y"
                  rows={3}
                />
              </Field>
              <Field label="Image URL" className="sm:col-span-2">
                <div className="flex gap-2">
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="input flex-1"
                    placeholder="/images/... or https://..."
                  />
                  {form.image && (
                    <img src={form.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 mt-1 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Leave empty to use category default image
                </p>
              </Field>

              <div className="sm:col-span-2 p-4 rounded-xl border border-white/8 bg-white/[0.02] space-y-3">
                <h3 className="text-sm font-semibold">Variants (color / size / other)</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Field label="Variant name">
                    <input
                      value={form.variantName}
                      onChange={(e) => setForm({ ...form, variantName: e.target.value })}
                      className="input"
                      placeholder="Colour"
                    />
                  </Field>
                  <Field label="Type">
                    <select
                      value={form.variantType}
                      onChange={(e) =>
                        setForm({ ...form, variantType: e.target.value as FormState['variantType'] })
                      }
                      className="input"
                    >
                      <option value="color">Color</option>
                      <option value="size">Size</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="Options (comma-separated)">
                    <input
                      value={form.variantOptions}
                      onChange={(e) => setForm({ ...form, variantOptions: e.target.value })}
                      className="input"
                      placeholder="Black, White"
                    />
                  </Field>
                </div>
              </div>

              <label className="sm:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured product
              </label>
            </div>
            <div className="p-5 border-t border-white/8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-violet-600 font-semibold text-sm hover:bg-violet-500"
              >
                {editing ? 'Save changes' : 'Create product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.55rem 0.85rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
