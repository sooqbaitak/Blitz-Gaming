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
  specsText: '',
  shippingWarranty: '',
  loyaltyPoints: '0',
  brand: '',
  tags: '',
  category: 'processors',
  subcategory: '',
  label: '',
  stock: 'in_stock',
  image: '',
  imagesText: '',
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
  specsText: string;
  shippingWarranty: string;
  loyaltyPoints: string;
  brand: string;
  tags: string;
  category: string;
  subcategory: string;
  label: string;
  stock: StockStatus;
  image: string;
  imagesText: string;
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
    specsText: Object.entries(p.specs ?? {}).map(([key, value]) => `${key}: ${value}`).join('\n'),
    shippingWarranty: p.shippingWarranty ?? '',
    loyaltyPoints: String(p.loyaltyPoints ?? 0),
    brand: p.brand,
    tags: p.tags.join(', '),
    category: p.category,
    subcategory: p.subcategory ?? '',
    label: p.label ?? '',
    stock: p.stock,
    image: p.image,
    imagesText: (p.images?.length ? p.images : [p.image]).join('\n'),
    featured: !!p.featured,
    variantName: v?.name ?? 'Colour',
    variantType: v?.type ?? 'color',
    variantOptions: v?.options.join(', ') ?? '',
  };
}

async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Not an image');
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1400;
  const ratio = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image compression is unavailable');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Image compression failed')), 'image/jpeg', 0.78));
  if (blob.size > 900 * 1024) throw new Error('Image is still too large; use an image URL instead');
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Image could not be read'));
    reader.onerror = () => reject(new Error('Image could not be read'));
    reader.readAsDataURL(blob);
  });
}

export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [params, setParams] = useSearchParams();
  const openNewFromQuery = params.get('new') === '1';
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(openNewFromQuery);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [query, setQuery] = useState('');
  const cats = flattenCategories();

  useEffect(() => {
    if (params.get('new') === '1') {
      const nextParams = new URLSearchParams(params);
      nextParams.delete('new');
      setParams(nextParams, { replace: true });
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

    const imageList = [...new Set(form.imagesText.split('\n').map((url) => url.trim()).filter(Boolean))].slice(0, 5);
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
      image: imageList[0] || form.image.trim() || getProductImageFallback(form.category),
      images: imageList.length ? imageList : [form.image.trim() || getProductImageFallback(form.category)],
      specs: Object.fromEntries(form.specsText.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
        const splitAt = line.indexOf(':');
        return splitAt >= 0 ? [line.slice(0, splitAt).trim(), line.slice(splitAt + 1).trim()] : [line, ''];
      }).filter(([key]) => Boolean(key))),
      shippingWarranty: form.shippingWarranty.trim(),
      loyaltyPoints: Math.max(0, Math.floor(Number(form.loyaltyPoints) || 0)),
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
              <Field label="Product images (upload or image links)" className="sm:col-span-2">
                <textarea
                  value={form.imagesText}
                  onChange={(e) => setForm({ ...form, imagesText: e.target.value, image: e.target.value.split('\n').map((x) => x.trim()).find(Boolean) ?? '' })}
                  className="input min-h-[90px] resize-y"
                  rows={3}
                  placeholder="Add one image URL per line, e.g. https://... or /images/..."
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-200 text-sm cursor-pointer hover:bg-violet-600/30">
                    <ImageIcon className="w-4 h-4" /> Upload images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={async (event) => {
                        const files = Array.from(event.currentTarget.files ?? []).slice(0, 5);
                        event.currentTarget.value = '';
                        try {
                          const urls = await Promise.all(files.map(compressImageFile));
                          setForm((previous) => {
                            const next = [...new Set([...previous.imagesText.split('\n').map((x) => x.trim()).filter(Boolean), ...urls])].slice(0, 5);
                            return { ...previous, imagesText: next.join('\n'), image: next[0] ?? previous.image };
                          });
                        } catch {
                          alert('Could not read one of the images. Try a JPG, PNG or WebP file under 10 MB.');
                        }
                      }}
                    />
                  </label>
                  <span className="text-[11px] text-zinc-500">Up to 5 images. Uploads are compressed and saved in this browser; links are recommended for live shared storage.</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                  {form.imagesText.split('\n').map((url) => url.trim()).filter(Boolean).map((url, index) => (
                    <div key={`${url.slice(0, 36)}-${index}`} className="relative group">
                      <img src={url} alt={`Product preview ${index + 1}`} className="w-full aspect-square rounded-lg object-cover border border-white/10 bg-black/20" />
                      <button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => setForm((previous) => {
                        const next = previous.imagesText.split('\n').map((x) => x.trim()).filter(Boolean).filter((_, i) => i !== index);
                        return { ...previous, imagesText: next.join('\n'), image: next[0] ?? '' };
                      })} className="absolute top-1 right-1 rounded-full bg-black/80 p-1 text-white opacity-90 hover:bg-red-600"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-600 mt-2">If you leave this empty, the category's default image is used.</p>
              </Field>

              <Field label="Specifications (one per line: Name: Value)" className="sm:col-span-2">
                <textarea value={form.specsText} onChange={(e) => setForm({ ...form, specsText: e.target.value })} className="input min-h-[100px] resize-y" rows={4} placeholder={'Sensor: PAW3311\nDPI: Up to 8000\nConnectivity: USB-C / 2.4G / Bluetooth'} />
              </Field>
              <Field label="Shipping & warranty" className="sm:col-span-2">
                <textarea value={form.shippingWarranty} onChange={(e) => setForm({ ...form, shippingWarranty: e.target.value })} className="input min-h-[80px] resize-y" rows={3} placeholder="Delivery options, estimated handling time and warranty coverage" />
              </Field>
              <Field label="Loyalty points earned per unit">
                <input type="number" min="0" step="1" value={form.loyaltyPoints} onChange={(e) => setForm({ ...form, loyaltyPoints: e.target.value })} className="input" />
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
